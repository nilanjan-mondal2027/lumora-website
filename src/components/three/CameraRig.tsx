"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { sampleCamera } from "@/lib/story";

// Drives the camera along the §4 keyframe path (Catmull-Rom position, lerped
// lookAt) from the shared progress ref — entirely inside useFrame, no React
// state. A little damping keeps scrubbing smooth without fighting Lenis.
export function CameraRig({ progressRef }: { progressRef: { current: number } }) {
  const camera = useThree((s) => s.camera);
  const tmp = useMemo(
    () => ({
      pos: [0, 0, 14] as [number, number, number],
      lookArr: [0, 0, 0] as [number, number, number],
      posTarget: new THREE.Vector3(),
      lookTarget: new THREE.Vector3(),
      lookVec: new THREE.Vector3(0, 0, 0),
    }),
    [],
  );

  useFrame((_, delta) => {
    sampleCamera(progressRef.current, tmp.pos, tmp.lookArr);
    tmp.posTarget.set(tmp.pos[0], tmp.pos[1], tmp.pos[2]);
    tmp.lookTarget.set(tmp.lookArr[0], tmp.lookArr[1], tmp.lookArr[2]);
    // frame-rate-independent damping toward the sampled keyframe.
    const a = 1 - Math.pow(0.0015, delta);
    camera.position.lerp(tmp.posTarget, a);
    tmp.lookVec.lerp(tmp.lookTarget, a);
    camera.lookAt(tmp.lookVec);
  });

  return null;
}
