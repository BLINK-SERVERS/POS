// Declaración mínima de la API nativa BarcodeDetector.
//
// `BarcodeDetector` (Shape Detection API) existe en Chrome/Edge (escritorio y
// Android) y en Safari 17+. TypeScript no la trae en su `lib.dom`, así que la
// declaramos aquí. Si el navegador no la expone, la cámara avisa al usuario y
// sugiere el lector USB o el celular como escáner remoto.

interface BlinkDetectedBarcode {
  rawValue: string;
  format: string;
}

interface BlinkBarcodeDetector {
  detect(source: CanvasImageSource): Promise<BlinkDetectedBarcode[]>;
}

interface BlinkBarcodeDetectorCtor {
  new (options?: { formats?: string[] }): BlinkBarcodeDetector;
  getSupportedFormats?: () => Promise<string[]>;
}

interface Window {
  BarcodeDetector?: BlinkBarcodeDetectorCtor;
}
