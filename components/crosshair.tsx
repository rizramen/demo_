import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

type PointerPosition = {
  x: number;
  y: number;
  visible: boolean;
};

const INITIAL_POINTER_POSITION: PointerPosition = {
  x: -1000,
  y: -1000,
  visible: false,
};

export function Crosshair() {
  const [pointer, setPointer] = useState<PointerPosition>(INITIAL_POINTER_POSITION);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    let animationFrameId = 0;
    const target = { ...INITIAL_POINTER_POSITION };
    const rendered = { ...INITIAL_POINTER_POSITION };

    const animate = () => {
      // Lerp for intentional pointer lag.
      const smoothing = 0.16;
      rendered.x += (target.x - rendered.x) * smoothing;
      rendered.y += (target.y - rendered.y) * smoothing;
      rendered.visible = target.visible;

      setPointer({
        x: rendered.x,
        y: rendered.y,
        visible: rendered.visible,
      });

      animationFrameId = window.requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      target.visible = true;
    };

    const handleMouseOut = (event: MouseEvent) => {
      // Only hide when the pointer leaves the browser viewport.
      if (event.relatedTarget) return;
      target.visible = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseOut);
    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseOut);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (Platform.OS !== "web") return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <View
        style={[
          styles.horizontalLine,
          {
            transform: [{ translateY: pointer.y }],
            opacity: pointer.visible ? 0.28 : 0,
          },
        ]}
      />
      <View
        style={[
          styles.verticalLine,
          {
            transform: [{ translateX: pointer.x }],
            opacity: pointer.visible ? 0.28 : 0,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    pointerEvents: "none",
  },
  horizontalLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#ffffff",
  },
  verticalLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "#ffffff",
  },
});
