import { useRef } from "react";
import { Box, Text, Flex } from "@chakra-ui/react";
import { toMetric } from "./utils/units";
import { SUBJECTS } from "./PhotographyGraphic";

function findXAtY(
  x: number,
  y: number,
  angle: number,
  targetY: number
): number {
  const angleRadians = angle * (Math.PI / 180);
  const slope = Math.tan(angleRadians);
  return ((targetY - y) / slope + x) * -1;
}

function findYAtX(
  x: number,
  _y: number,
  angle: number,
  targetX: number
): number {
  const angleRadians = angle * (Math.PI / 180);
  const slope = Math.tan(angleRadians);
  return slope * (targetX - x);
}

function buildViewPath(
  x: number,
  y: number,
  verticalFieldOfView: number,
  farDistanceInInches: number,
  height: number
) {
  let path = `M${x},${y - 1}`;

  const topRayIntercept = findXAtY(x, y, verticalFieldOfView / 2, 0);
  if (topRayIntercept < farDistanceInInches) {
    path += ` L${topRayIntercept},0 L${farDistanceInInches},0`;
  } else {
    const topRayInterceptY = findYAtX(
      x,
      y,
      verticalFieldOfView / 2,
      farDistanceInInches
    );
    path += ` L${farDistanceInInches},${y - topRayInterceptY}`;
  }
  path += ` L${farDistanceInInches},${y}`;

  const bottomRayIntercept = findXAtY(x, y, -verticalFieldOfView / 2, height);
  if (bottomRayIntercept < farDistanceInInches) {
    path += ` L${farDistanceInInches},${height} L${bottomRayIntercept},${height}`;
  } else {
    const bottomRayInterceptY = findYAtX(
      x,
      y,
      -(verticalFieldOfView / 2),
      farDistanceInInches
    );
    path += ` L${farDistanceInInches},${y + -bottomRayInterceptY}`;
  }

  path += ` L${x},${y + 1} Z`;

  return path;
}

// Icône d'appareil photo simple
const CameraIcon = ({ y }: { y: number }) => (
  <g transform={`translate(-10, ${y - 5})`}>
    {/* Corps de l'appareil */}
    <rect x="0" y="2" width="10" height="7" rx="1" fill="#212E40" />
    {/* Objectif */}
    <circle cx="5" cy="5.5" r="2.5" fill="#212E40" />
    <circle cx="5" cy="5.5" r="1.5" fill="#EFF7FB" />
    {/* Flash */}
    <rect x="1" y="0" width="3" height="2" rx="0.5" fill="#212E40" />
  </g>
);

export default function PhotographyGraphicMobile({
  distanceToSubjectInInches,
  nearFocalPointInInches,
  farFocalPointInInches,
  farDistanceInInches,
  hyperFocalDistanceInInches,
  subject,
  focalLength,
  aperture,
  verticalFieldOfView,
  onChangeDistance,
  isDepthOfFieldInfinite = false,
}: {
  distanceToSubjectInInches: number;
  nearFocalPointInInches: number;
  farFocalPointInInches: number;
  farDistanceInInches: number;
  hyperFocalDistanceInInches: number;
  focalLength: number;
  aperture: number;
  verticalFieldOfView: number;
  subject: keyof typeof SUBJECTS;
  onChangeDistance?: (distance: number) => void;
  isDepthOfFieldInfinite?: boolean;
}) {
  const convertUnits = toMetric;

  const svgRef = useRef<SVGSVGElement>(null);
  const mouseDownRef = useRef(false);

  const SubjectGraphic = SUBJECTS[subject].graphic;
  const height = SUBJECTS[subject].height;

  // Largeur de la fenêtre de visualisation (~3m = 120 inches)
  const viewWidth = 120;
  
  // Centrer le viewBox sur le sujet, avec des limites
  // On garde une marge à gauche pour que le sujet ne soit pas collé au bord
  const viewStartX = Math.max(
    -15, // Minimum : montrer l'appareil photo
    Math.min(
      distanceToSubjectInInches - viewWidth * 0.4, // Sujet à 40% depuis la gauche
      farDistanceInInches - viewWidth // Maximum : ne pas dépasser la fin
    )
  );
  
  function onMouseDown() {
    mouseDownRef.current = true;
  }
  function onMouseUp() {
    mouseDownRef.current = false;
  }
  function onMouseMove(evt: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    if (mouseDownRef.current) {
      const pt = svgRef.current!.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;
      const cursorpt = pt.matrixTransform(
        svgRef.current!.getScreenCTM()!.inverse()
      );
      const x = Math.max(5, Math.min(farDistanceInInches, cursorpt.x));
      onChangeDistance?.(x);
    }
  }
  
  function onTouchStart() {
    mouseDownRef.current = true;
  }
  function onTouchEnd() {
    mouseDownRef.current = false;
  }
  function onTouchMove(evt: React.TouchEvent<SVGSVGElement>) {
    if (mouseDownRef.current && evt.touches.length > 0) {
      const touch = evt.touches[0];
      const pt = svgRef.current!.createSVGPoint();
      pt.x = touch.clientX;
      pt.y = touch.clientY;
      const cursorpt = pt.matrixTransform(
        svgRef.current!.getScreenCTM()!.inverse()
      );
      const x = Math.max(5, Math.min(farDistanceInInches, cursorpt.x));
      onChangeDistance?.(x);
    }
  }

  // Construire le path du champ de vision pour toute la distance
  const viewPath = buildViewPath(
    0,
    14.3,
    verticalFieldOfView,
    farDistanceInInches,
    height
  );

  // Convertir l'hyperfocale en mètres
  const hyperFocalInMeters = (hyperFocalDistanceInInches * 0.0254).toFixed(2);

  // Calcul de la profondeur de champ
  const depthOfFieldDisplay = isDepthOfFieldInfinite 
    ? "∞" 
    : convertUnits(farFocalPointInInches - nearFocalPointInInches);

  // Distance au sujet
  const distanceToSubjectDisplay = convertUnits(distanceToSubjectInInches, 1);

  // Limites de netteté
  const nearLimitDisplay = convertUnits(nearFocalPointInInches, 2);
  const farLimitDisplay = isDepthOfFieldInfinite ? "∞" : convertUnits(farFocalPointInInches, 2);

  // Est-ce que l'appareil photo est visible dans le viewBox actuel ?
  const showCamera = viewStartX <= 0;

  return (
    <Box width="100%">
      {/* Infos en haut : réglages + hyperfocale */}
      <Flex justify="space-between" align="center" mb={2} px={2}>
        <Text fontSize="lg" fontWeight="bold" color="#212E40">
          {focalLength}mm f/{aperture}
        </Text>
        <Box textAlign="right">
          <Text fontSize="xs" color="#FB9936" fontWeight="bold">
            Hyperfocale
          </Text>
          <Text fontSize="md" color="#FB9936" fontWeight="bold">
            {hyperFocalInMeters}m
          </Text>
        </Box>
      </Flex>

      {/* SVG avec viewBox centré sur le sujet */}
      <svg
        ref={svgRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`${viewStartX} 0 ${viewWidth} ${height}`}
        style={{ width: "100%", height: "auto", touchAction: "none" }}
      >
        <defs>
          <clipPath id="fov-mobile">
            <path d={viewPath} />
          </clipPath>
        </defs>

        {/* Champ de vision */}
        <path d={viewPath} fill="#EFF7FB" />

        {/* Appareil photo (si visible) */}
        {showCamera && <CameraIcon y={14.3} />}

        {/* Zone de netteté */}
        <rect
          x={nearFocalPointInInches}
          y={0}
          width={(isDepthOfFieldInfinite ? farDistanceInInches : farFocalPointInInches) - nearFocalPointInInches}
          height={height}
          fill="#FB9936"
          fillOpacity={0.3}
        />

        {/* Marqueur hyperfocale (si visible dans la fenêtre) */}
        {hyperFocalDistanceInInches > viewStartX && 
         hyperFocalDistanceInInches < viewStartX + viewWidth && 
         hyperFocalDistanceInInches > 0 && (
          <line
            x1={hyperFocalDistanceInInches}
            y1={0}
            x2={hyperFocalDistanceInInches}
            y2={height}
            stroke="#FB9936"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        )}

        {/* Sujet (grisé) */}
        <g fill="#aaa">
          <g transform={`translate(${distanceToSubjectInInches})`}>
            <SubjectGraphic />
          </g>
        </g>
        
        {/* Sujet (dans le champ de vision) */}
        <g clipPath="url(#fov-mobile)">
          <g transform={`translate(${distanceToSubjectInInches})`}>
            <SubjectGraphic />
          </g>
        </g>

        {/* Ligne de mise au point */}
        <line
          x1={distanceToSubjectInInches}
          y1={0}
          x2={distanceToSubjectInInches}
          y2={height}
          stroke="#212E40"
          strokeWidth={0.5}
        />
      </svg>

      {/* Infos en bas : distance + profondeur de champ */}
      <Box mt={2} px={2}>
        <Flex justify="center" gap={6}>
          <Box textAlign="center">
            <Text fontSize="xs" color="gray.500">
              Distance au sujet
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="#212E40">
              {distanceToSubjectDisplay}
            </Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="xs" color="gray.500">
              Profondeur de champ
            </Text>
            <Text fontSize="lg" fontWeight="bold" color="#212E40">
              {depthOfFieldDisplay}
            </Text>
          </Box>
        </Flex>
        <Flex justify="center" mt={1}>
          <Text fontSize="sm" color="gray.600">
            De {nearLimitDisplay} à {farLimitDisplay}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
