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

// Silhouette simplifiée du photographe pour mobile
const PhotographerSimple = () => (
  <path
    fill="#212E40"
    transform="translate(-12 2) scale(0.3)"
    d="M43.5,10.57c-.06.05-.14.06-.21.06-.56.02-1.11.02-1.67.05-.23.01-.36-.05-.39-.28-.02-.15-.09-.22-.2-.05-.1.14-.26.1-.4.1-.29.01-.36-.06-.37.34,0,.47-.33.68-.76.5-.19-.08-.29-.08-.37.14-.1.28-.32.46-.59.6-.54.28-1.13.34-1.72.45-.25.05-.51.08-.75.14-.4.09-.58.31-.59.72-.03,1.02-.14,2.04-.27,3.06-.02.15,0,.28.11.39.19.2.21.43.13.68-.42,1.3-1.01,2.51-1.85,3.59-.46.6-1.05,1.01-1.84,1.06-.1,0-.2,0-.29,0-.31-.03-.31-.04-.38.28-.18.82-.5,1.04-1.33.88-.45-.09-.86-.26-1.27-.45-.75-.35-1.47-.76-2.17-1.2-.30-.19-.30-.19-.45.12-.45.9-.88,1.8-1.35,2.68-.28.54-.48,1.1-.59,1.7-.13.7-.22,1.41-.24,2.13-.02,1.36.33,2.63.87,3.87.71,1.62,1.58,3.15,2.47,4.66.11.19.25.38.34.58.54,1.13,1.42,2.02,2.1,3.05,1.15,1.73,2.28,3.47,3.25,5.31.43.81.57,1.68.66,2.56.14,1.5-.07,2.99-.24,4.47-.2,1.69-.5,3.38-.61,5.08-.05.75,0,1.49.11,2.23.14.91.05,1.81,0,2.72-.06,1.1-.25,2.2.07,3.3.05.18.12.34.24.47.53.57,1.07,1.13,1.84,1.38.43.14.87.19,1.31.2.41.01.83.02,1.24.09.76.14,1,.83.51,1.42-.21.25-.49.4-.79.5-.52.18-1.05.25-1.60.26-1,.03-2-.08-3-.09-.32,0-.65-.01-.97,0-.41.03-.77-.08-1.12-.27-.22-.12-.45-.25-.66-.39-.13-.08-.19-.09-.17.09.02.18-.04.26-.24.25-1.15-.11-2.29-.21-3.42-.44-.15-.03-.23-.09-.23-.25-.04-.85-.11-1.7.02-2.55.08-.49.24-.95.52-1.36.08-.12.12-.25.13-.40.06-1.68.12-3.37.18-5.05.06-1.6.12-3.2.18-4.8.06-1.69.12-3.38.19-5.08.02-.44.03-.87.05-1.31,0-.10-.02-.17-.10-.23-1.31-1.11-2.62-2.21-3.93-3.32-.03-.02-.05-.06-.12-.04-.06.48-.12.97-.18,1.46-.17,1.41-.35,2.82-.52,4.23-.11.93-.23,1.85-.33,2.78-.03.25-.11.44-.31.62-2.24,1.97-4.46,3.95-6.69,5.93-1.93,1.71-3.85,3.42-5.78,5.12-.20.17-.33.36-.37.62-.05.30-.13.59-.20.88-.03.12-.03.26-.20.29-.09.01-.05.08-.01.12.91,1.13,1.91,2.09,3.49,2.13.59.01,1.19.01,1.77.18.57.16.81.68.57,1.23-.14.33-.40.54-.71.70-.56.27-1.16.37-1.77.40-1.08.05-2.16-.05-3.25-.12-.47-.03-.95-.04-1.42-.01-.49.03-.92-.11-1.33-.35-.24-.14-.48-.29-.71-.44-.12-.07-.15-.05-.16.09-.01.30-.02.31-.33.29-1.22-.11-2.44-.26-3.64-.50-.21-.04-.30-.14-.30-.36-.03-.72-.05-1.44,0-2.17.07-1.34.69-2.38,1.75-3.17.21-.15.34-.28.19-.54-.07-.13.02-.21.10-.29.99-1.06,1.98-2.13,2.97-3.19,2.09-2.23,4.17-4.47,6.33-6.63.91-.92,1.85-1.81,2.82-2.67.66-.58.88-1.29.80-2.12-.29-3.12-.90-6.18-1.75-9.18-.34-1.20-.79-2.37-1.20-3.55-.16-.46-.28-.94-.38-1.41-.05-.26-.05-.26-.31-.16-.18.07-.36.14-.54.22-.15.07-.22.03-.23-.14,0-.26-.03-.51-.04-.77-.05-1.28-.10-2.56-.16-3.83,0-.13.01-.25.05-.38.38-1.16.74-2.32,1.13-3.48.14-.41.36-.80.55-1.19.45-.93.89-1.88,1.24-2.86.18-.51.25-1.04.31-1.57.18-1.50.62-2.93,1.11-4.34.82-2.38,1.74-4.73,2.85-7,.45-.92.93-1.83,1.60-2.61.52-.61,1.15-1.04,1.98-1.09.04,0,.08-.02.11,0,.35.11.51-.09.68-.35.17-.28.42-.49.65-.72.12-.11.21-.13.35-.02.47.36.94.70,1.41,1.05.21.16.21.16.31-.09.28-.71.40-1.46.58-2.20.23-.93.61-1.77,1.39-2.36.91-.70,1.95-1.09,3.09-1.24.95-.12,1.77.15,2.49.76.67.57,1.38,1.07,2.15,1.48.16.09.31.19.45.31.44.37.46.84.05,1.25-.23.24-.53.37-.84.48-.17.06-.23.14-.23.33,0,.48.07.94.15,1.41.04.26.21.22.38.22.17,0,.26-.04.28-.23.03-.34.04-.34.38-.35.53,0,1.05,0,1.58-.02.21,0,.28.07.27.27-.01.28,0,.56,0,.84-.01.21.07.27.27.27,1-.01,2,0,3-.02.28,0,.55-.03.65.34.10-.08.13-.17.15-.25.06-.25.22-.32.46-.31.58.03,1.16.03,1.74.05v3.34Z"
  />
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

  // Limiter le viewBox pour mobile - zoom sur une zone pertinente
  // On prend max 8 mètres (315 inches) ou la distance max si plus petite
  const maxViewDistance = Math.min(farDistanceInInches, 315);
  
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

  const SubjectGraphic = SUBJECTS[subject].graphic;
  const height = SUBJECTS[subject].height;

  const viewPath = buildViewPath(
    0,
    14.3,
    verticalFieldOfView,
    maxViewDistance,
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

      {/* SVG simplifié - juste le visuel */}
      <svg
        ref={svgRef}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`-15 0 ${maxViewDistance + 15} ${height}`}
        style={{ width: "100%", height: "auto", touchAction: "none" }}
      >
        <defs>
          <clipPath id="fov-mobile">
            <path d={viewPath} />
          </clipPath>
          <clipPath id="subject-mobile">
            <rect x={0} y={0} width={500} height={height} />
          </clipPath>
        </defs>

        {/* Champ de vision */}
        <path d={viewPath} fill="#EFF7FB" />

        {/* Photographe */}
        <PhotographerSimple />

        {/* Zone de netteté */}
        <rect
          x={nearFocalPointInInches}
          y={0}
          width={(isDepthOfFieldInfinite ? maxViewDistance : Math.min(farFocalPointInInches, maxViewDistance)) - nearFocalPointInInches}
          height={height}
          fill="#FB9936"
          fillOpacity={0.3}
        />

        {/* Marqueur hyperfocale (si visible) */}
        {hyperFocalDistanceInInches <= maxViewDistance && hyperFocalDistanceInInches > 0 && (
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
