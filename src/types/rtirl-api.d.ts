// Type shim for @rtirl/api — the package's exports field points to a directory
// which doesn't resolve with "bundler" module resolution.

declare module '@rtirl/api' {
  type Unsubscribe = () => void;

  interface Location {
    latitude: number;
    longitude: number;
  }

  type Speed = number;
  type Heading = number;
  type Altitude = number;
  type HeartRate = number;
  type UUID = string | null;

  interface PullKeyAPI {
    addLocationListener(callback: (location: Location) => void): Unsubscribe;
    addSpeedListener(callback: (speed: Speed) => void): Unsubscribe;
    addHeadingListener(callback: (heading: Heading) => void): Unsubscribe;
    addAltitudeListener(callback: (altitude: Altitude) => void): Unsubscribe;
    addHeartRateListener(callback: (heartRate: HeartRate) => void): Unsubscribe;
    addCyclingPowerListener(callback: (power: number) => void): Unsubscribe;
    addCyclingCrankListener(callback: (power: number) => void): Unsubscribe;
    addCyclingWheelListener(callback: (power: number) => void): Unsubscribe;
    addPedometerStepsListener(callback: (steps: number) => void): Unsubscribe;
    addListener(callback: (data: Record<string, unknown>) => void): Unsubscribe;
    addSessionIdListener(callback: (sessionId: UUID) => void): Unsubscribe;
  }

  export function forPullKey(pullKey: string): PullKeyAPI;
  export function forStreamer(provider: string, userId: string): {
    addLocationListener(callback: (location: Location | null) => void): Unsubscribe;
  };
}
