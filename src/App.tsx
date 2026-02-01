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
} from "@chakra-ui/react";

import PhotographyGraphic, { SUBJECTS } from "./PhotographyGraphic";

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
    fontSize: "sm",
  };

  const distanceMarks = useMemo(() => {
    const farDistanceInMeters = farDistanceInInches * 0.0254;
    function convertMetersToInches(meters: number) {
      return meters * 39.3701;
    }
    return new Array(Math.floor(farDistanceInMeters) + 1)
      .fill(0)
      .map((_val, val) => ({
        value: convertMetersToInches(val + 1),
        label: `${val + 1}m`,
      }));
  }, [farDistanceInInches]);

  const focalLengthMarks = [8, 14, 24, 28, 35, 50, 85, 135, 200, 400, 800].map((focal) => ({
    value: focalToSlider(focal),
    label: `${focal}`,
  }));

  return (
    <>
      <Box p={2} pt={6}>
        <PhotographyGraphic
          distanceToSubjectInInches={distanceToSubjectInInches}
          nearFocalPointInInches={nearFocalPointInInches}
          farFocalPointInInches={farFocalPointInInches}
          farDistanceInInches={farDistanceInInches}
          subject={subject as keyof typeof SUBJECTS}
          focalLength={focalLengthInMillimeters}
          aperture={aperture}
          verticalFieldOfView={verticalFieldOfView}
          onChangeDistance={(val) => setDistanceToSubjectInInches(val)}
        />
      </Box>

      <Box px={6}>
        <Box pt={8}>
          <Flex gap={2}>
            <Box w="20%">
              <Text align="right">Distance au sujet (m)</Text>
            </Box>
            <Box flexGrow={1}>
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
                <SliderThumb borderColor="#212E40" />
              </Slider>
            </Box>
          </Flex>
        </Box>

        <Box pt={10}>
          <Flex gap={2}>
            <Box w="20%">
              <Text align="right">Longueur focale (mm)</Text>
            </Box>
            <Box flexGrow={1}>
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
                <SliderThumb borderColor="#212E40" />
              </Slider>
            </Box>
          </Flex>
        </Box>

        <Box pt={10}>
          <Flex gap={2}>
            <Box w="20%">
              <Text align="right">Ouverture</Text>
            </Box>
            <Box flexGrow={1}>
              <Slider
                aria-label="ouverture"
                value={aperture}
                onChange={(val: number) => setAperture(val)}
                min={0.8}
                max={22}
                step={0.1}
              >
                {[0.8, 1.4, 1.8, 2.8, 4, 5.6, 8, 11, 16, 22].map((val) => (
                  <SliderMark key={val} value={val} {...labelStyles}>
                    {val}
                  </SliderMark>
                ))}
                <SliderTrack bg="#EFF7FB">
                  <SliderFilledTrack bg="#FB9936" />
                </SliderTrack>
                <SliderThumb borderColor="#212E40" />
              </Slider>
            </Box>
          </Flex>
        </Box>

        <Box pt={12}>
          <Flex gap={2}>
            <Flex gap={2} width="50%">
              <Box w="20%" mt={2}>
                <Text align="right">Taille du capteur</Text>
              </Box>
              <Box flexGrow={1}>
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
            </Flex>

            <Flex gap={2} width="50%">
              <Box w="20%" mt={2}>
                <Text align="right">Sujet</Text>
              </Box>
              <Box flexGrow={1}>
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
          </Flex>
        </Box>

        <Box p={4} pt={6}>
          <Flex gap={5} justify="center" flexWrap="wrap">
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
                _hover={{ bg: "#FB9936" }}
              >
                {setup.name}
              </Button>
            ))}
          </Flex>
        </Box>

        <Box p={4} pt={6}>
          <Flex direction="column" align="center" gap={2}>
            <Text fontSize="sm" color="#212E40">
              Simulateur de profondeur de champ pour{" "}
              <a
                href="https://apprendre.photo"
                target="_blank"
                style={{ color: "#FB9936", fontWeight: "bold" }}
              >
                Apprendre.Photo
              </a>
            </Text>
            <Text fontSize="xs" color="#666">
              Basé sur le travail open source de{" "}
              <a
                href="https://github.com/jherr/depth-of-field"
                target="_blank"
                style={{ color: "#FB9936" }}
              >
                Jack Herrington
              </a>
            </Text>
          </Flex>
        </Box>
      </Box>
    </>
  );
}

export default App;
