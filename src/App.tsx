import { useState, useMemo } from "react";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Box,
  Flex,
  Text,
  Select,
  Button,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";

import PhotographyGraphic, { SUBJECTS } from "./PhotographyGraphic";
import PhotographyGraphicMobile from "./PhotographyGraphicMobile";

const CIRCLES_OF_CONFUSION: Record<
  string,
  {
    coc: number;
    sensorHeight: number;
  }
> = {
  "Plein format (35mm)": {
    coc: 0.029,
    sensorHeight: 24,
  },
  "APS-C": {
    coc: 0.019,
    sensorHeight: 15.6,
  },
  "Micro 4/3": {
    coc: 0.015,
    sensorHeight: 13,
  },
  Smartphone: {
    coc: 0.002,
    sensorHeight: 7.3,
  },
};

const COMMON_SETUPS: {
  name: string;
  focalLength: number;
  aperture: number;
  idealDistance: number;
  sensor: string;
}[] = [
  {
    name: "Smartphone",
    focalLength: 4.3,
    aperture: 2.0,
    idealDistance: 36,
    sensor: "Smartphone",
  },
  {
    name: "APS-C - 35mm",
    focalLength: 35,
    aperture: 1.8,
    idealDistance: 72,
    sensor: "APS-C",
  },
  {
    name: "FF - 28mm",
    focalLength: 28,
    aperture: 1.4,
    idealDistance: 48,
    sensor: "Plein format (35mm)",
  },
  {
    name: "FF - 35mm",
    focalLength: 35,
    aperture: 1.4,
    idealDistance: 60,
    sensor: "Plein format (35mm)",
  },
  {
    name: "FF - 50mm",
    focalLength: 50,
    aperture: 1.8,
    idealDistance: 72,
    sensor: "Plein format (35mm)",
  },
  {
    name: "FF - 70mm",
    focalLength: 70,
    aperture: 2.8,
    idealDistance: 96,
    sensor: "Plein format (35mm)",
  },
];

// Logarithmic scale for focal length
const MIN_FOCAL = 8;
const MAX_FOCAL = 800;

function focalToSlider(focal: number): number {
  const clamped = Math.max(focal, MIN_FOCAL);
  return 100 * Math.log(clamped / MIN_FOCAL) / Math.log(MAX_FOCAL / MIN_FOCAL);
}

function sliderToFocal(sliderValue: number): number {
  return Math.round(MIN_FOCAL * Math.pow(MAX_FOCAL / MIN_FOCAL, sliderValue / 100));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function App() {
  const [distanceToSubjectInInches, setDistanceToSubjectInInches] =
    useState(72);
  const [focalLengthInMillimeters, setFocalLengthInMillimeters] = useState(50);
  const [aperture, setAperture] = useState(1.8);
  const [subject, setSubject] = useState("Humain");
  const [sensor, setSensor] = useState("Plein format (35mm)");

  // Responsive: moins de marks sur mobile
  const isMobile = useBreakpointValue({ base: true, md: false });

  const distanceToSubjectInMM = distanceToSubjectInInches * 25.4;

  const circleOfConfusionInMillimeters = CIRCLES_OF_CONFUSION[sensor].coc;

  const hyperFocalDistanceInMM =
    focalLengthInMillimeters +
    (focalLengthInMillimeters * focalLengthInMillimeters) /
      (aperture * circleOfConfusionInMillimeters);
  const depthOfFieldFarLimitInMM =
    (hyperFocalDistanceInMM * distanceToSubjectInMM) /
    (hyperFocalDistanceInMM -
      (distanceToSubjectInMM - focalLengthInMillimeters));
  const depthOfFieldNearLimitInMM =
    (hyperFocalDistanceInMM * distanceToSubjectInMM) /
    (hyperFocalDistanceInMM +
      (distanceToSubjectInMM - focalLengthInMillimeters));

  const farDistanceInInches = 360;
  const hyperFocalDistanceInInches = hyperFocalDistanceInMM / 25.4;
  const nearFocalPointInInches = clamp(
    depthOfFieldNearLimitInMM / 25.4,
    0,
    farDistanceInInches
  );
  let farFocalPointInInches = clamp(
    depthOfFieldFarLimitInMM / 25.4,
    0,
    farDistanceInInches
  );
  
  // Détecter si la profondeur de champ est infinie (mise au point >= hyperfocale)
  const isDepthOfFieldInfinite = distanceToSubjectInInches >= hyperFocalDistanceInInches || 
    farFocalPointInInches < nearFocalPointInInches ||
    depthOfFieldFarLimitInMM < 0;
  
  if (farFocalPointInInches < nearFocalPointInInches) {
    farFocalPointInInches = farDistanceInInches;
  }

  const sensorHeight = CIRCLES_OF_CONFUSION[sensor].sensorHeight;
  const verticalFieldOfView =
    (2 * Math.atan(sensorHeight / 2 / focalLengthInMillimeters) * 180) /
    Math.PI;

  const labelStyles = {
    mt: "2",
    ml: "-2.5",
    fontSize: "xs",
  };

  // Marques de distance : tous les 1m sur desktop, tous les 2m sur mobile
  const distanceMarks = useMemo(() => {
    const farDistanceInMeters = farDistanceInInches * 0.0254;
    function convertMetersToInches(meters: number) {
      return meters * 39.3701;
    }
    const marks = [];
    const step = isMobile ? 2 : 1;
    for (let m = step; m <= Math.floor(farDistanceInMeters); m += step) {
      marks.push({
        value: convertMetersToInches(m),
        label: `${m}m`,
      });
    }
    return marks;
  }, [farDistanceInInches, isMobile]);

  // Marques de focale : complètes sur desktop, réduites sur mobile
  const focalLengthMarks = useMemo(() => {
    const focalValues = isMobile 
      ? [8, 24, 50, 135, 400]
      : [8, 14, 24, 35, 50, 85, 135, 200, 400, 800];
    return focalValues.map((focal) => ({
      value: focalToSlider(focal),
      label: `${focal}`,
    }));
  }, [isMobile]);

  // Marques d'ouverture : complètes sur desktop, réduites sur mobile
  const apertureMarks = useMemo(() => {
    return isMobile 
      ? [1.4, 2.8, 5.6, 11, 22]
      : [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
  }, [isMobile]);

  // Props communes pour les deux composants graphiques
  const graphicProps = {
    distanceToSubjectInInches,
    nearFocalPointInInches,
    farFocalPointInInches,
    farDistanceInInches,
    hyperFocalDistanceInInches,
    subject: subject as keyof typeof SUBJECTS,
    focalLength: focalLengthInMillimeters,
    aperture,
    verticalFieldOfView,
    onChangeDistance: (val: number) => setDistanceToSubjectInInches(val),
    isDepthOfFieldInfinite,
  };

  return (
    <Box>
      {/* Visualisation */}
      <Box p={2} pt={4}>
        {isMobile ? (
          <PhotographyGraphicMobile {...graphicProps} />
        ) : (
          <PhotographyGraphic {...graphicProps} isMobile={false} />
        )}
      </Box>

      {/* Contrôles */}
      <Box px={{ base: 3, md: 6 }}>
        <VStack spacing={{ base: 3, md: 8 }} align="stretch">
          
          {/* Slider Distance */}
          <Box pt={{ base: 2, md: 4 }}>
            <Text fontWeight="medium" fontSize="sm" mb={2}>
              Distance au sujet (m)
            </Text>
            <Box px={2} pb={{ base: 3, md: 4 }}>
              <Slider
                aria-label="distance au sujet"
                value={distanceToSubjectInInches}
                onChange={(val: number) => setDistanceToSubjectInInches(val)}
                min={10}
                max={400}
                step={1}
              >
                {distanceMarks.map(({ label, value }) => (
                  <SliderMark key={value} value={value} {...labelStyles}>
                    {label}
                  </SliderMark>
                ))}
                <SliderTrack bg="#EFF7FB">
                  <SliderFilledTrack bg="#FB9936" />
                </SliderTrack>
                <SliderThumb borderColor="#212E40" boxSize={5} />
              </Slider>
            </Box>
          </Box>

          {/* Slider Focale */}
          <Box>
            <Text fontWeight="medium" fontSize="sm" mb={2}>
              Longueur focale (mm)
            </Text>
            <Box px={2} pb={{ base: 3, md: 4 }}>
              <Slider
                aria-label="longueur focale"
                value={focalToSlider(focalLengthInMillimeters)}
                onChange={(val: number) => setFocalLengthInMillimeters(sliderToFocal(val))}
                min={0}
                max={100}
                step={0.1}
              >
                {focalLengthMarks.map(({ value, label }) => (
                  <SliderMark key={label} value={value} {...labelStyles}>
                    {label}
                  </SliderMark>
                ))}
                <SliderTrack bg="#EFF7FB">
                  <SliderFilledTrack bg="#FB9936" />
                </SliderTrack>
                <SliderThumb borderColor="#212E40" boxSize={5} />
              </Slider>
            </Box>
          </Box>

          {/* Slider Ouverture */}
          <Box>
            <Text fontWeight="medium" fontSize="sm" mb={2}>
              Ouverture
            </Text>
            <Box px={2} pb={{ base: 3, md: 4 }}>
              <Slider
                aria-label="ouverture"
                value={aperture}
                onChange={(val: number) => setAperture(val)}
                min={0.8}
                max={22}
                step={0.1}
              >
                {apertureMarks.map((val) => (
                  <SliderMark key={val} value={val} {...labelStyles}>
                    {val}
                  </SliderMark>
                ))}
                <SliderTrack bg="#EFF7FB">
                  <SliderFilledTrack bg="#FB9936" />
                </SliderTrack>
                <SliderThumb borderColor="#212E40" boxSize={5} />
              </Slider>
            </Box>
          </Box>

          {/* Sélecteurs Capteur et Sujet */}
          <Flex 
            gap={{ base: 2, md: 4 }} 
            direction={{ base: "column", md: "row" }}
          >
            <Box flex="1">
              <Text fontWeight="medium" fontSize="sm" mb={2}>
                Taille du capteur
              </Text>
              <Select
                value={sensor}
                placeholder="Capteur"
                onChange={(evt) => {
                  if (!evt?.target?.value) {
                    return;
                  }
                  setSensor(evt?.target?.value);
                }}
                borderColor="#212E40"
                _hover={{ borderColor: "#FB9936" }}
                _focus={{ borderColor: "#FB9936", boxShadow: "0 0 0 1px #FB9936" }}
              >
                {Object.entries(CIRCLES_OF_CONFUSION).map(([key]) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </Select>
            </Box>

            <Box flex="1">
              <Text fontWeight="medium" fontSize="sm" mb={2}>
                Sujet
              </Text>
              <Select
                value={subject}
                placeholder="Sujet"
                onChange={(evt) => {
                  if (SUBJECTS[evt?.target?.value as keyof typeof SUBJECTS]) {
                    setSubject(evt?.target?.value);
                  }
                }}
                borderColor="#212E40"
                _hover={{ borderColor: "#FB9936" }}
                _focus={{ borderColor: "#FB9936", boxShadow: "0 0 0 1px #FB9936" }}
              >
                {Object.entries(SUBJECTS).map(([key]) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </Select>
            </Box>
          </Flex>

          {/* Boutons presets */}
          <Box pt={2}>
            <Text fontWeight="medium" fontSize="sm" mb={3} textAlign="center">
              Configurations courantes
            </Text>
            <Flex gap={2} justify="center" flexWrap="wrap">
              {COMMON_SETUPS.map((setup) => (
                <Button
                  key={setup.name}
                  onClick={() => {
                    setFocalLengthInMillimeters(setup.focalLength);
                    setAperture(setup.aperture);
                    setSensor(setup.sensor);
                    setDistanceToSubjectInInches(setup.idealDistance);
                  }}
                  bg="#212E40"
                  color="white"
                  size={{ base: "sm", md: "md" }}
                  _hover={{ bg: "#FB9936" }}
                >
                  {setup.name}
                </Button>
              ))}
            </Flex>
          </Box>

          {/* Crédit */}
          <Box pb={4}>
            <Text fontSize="xs" color="#666" textAlign="center">
              Basé sur le travail open source de{" "}
              <a
                href="https://github.com/jherr/depth-of-field"
                target="_blank"
                style={{ color: "#FB9936" }}
              >
                Jack Herrington
              </a>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export default App;
