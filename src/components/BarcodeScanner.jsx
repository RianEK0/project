import { useEffect, useRef, useState } from "react";

const barcodeFormats = [
  "aztec",
  "code_128",
  "code_39",
  "code_93",
  "codabar",
  "data_matrix",
  "ean_13",
  "ean_8",
  "itf",
  "pdf417",
  "qr_code",
  "upc_a",
  "upc_e"
];

function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const handledRef = useRef(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [status, setStatus] = useState("Membuka kamera...");
  const [error, setError] = useState("");

  useEffect(() => {
    let stream;
    let frameId;
    let stopped = false;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Kamera tidak tersedia di browser ini.");
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        if (!("BarcodeDetector" in window)) {
          setStatus("Kamera aktif.");
          setError("Deteksi otomatis belum didukung browser ini. Masukkan barcode manual.");
          return;
        }

        const detector = new window.BarcodeDetector({ formats: barcodeFormats });
        setStatus("Arahkan kamera ke barcode.");

        async function scanFrame() {
          if (stopped || handledRef.current || !videoRef.current) return;

          try {
            if (videoRef.current.readyState >= 2) {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0) {
                const value = codes[0].rawValue;
                handledRef.current = true;
                onDetected(value);
                onClose();
                return;
              }
            }
          } catch (scanError) {
            setError("Barcode belum terbaca. Coba dekatkan kamera.");
          }

          frameId = window.requestAnimationFrame(scanFrame);
        }

        scanFrame();
      } catch (cameraError) {
        setError("Izin kamera ditolak atau kamera tidak bisa dibuka.");
        setStatus("Masukkan barcode manual.");
      }
    }

    startCamera();

    return () => {
      stopped = true;
      if (frameId) window.cancelAnimationFrame(frameId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [onDetected, onClose]);

  function submitManual(event) {
    event.preventDefault();
    const value = manualBarcode.trim();
    if (!value) return;
    handledRef.current = true;
    onDetected(value);
    onClose();
  }

  return (
    <div className="modal-backdrop scanner-backdrop" role="dialog" aria-modal="true">
      <section className="scanner-modal">
        <div className="section-heading">
          <h2>Scan Barcode</h2>
          <button className="ghost-btn" onClick={onClose}>
            Tutup
          </button>
        </div>

        <div className="scanner-frame">
          <video ref={videoRef} muted playsInline />
          <div className="scan-line" />
        </div>

        <p className="scanner-status">{error || status}</p>

        <form className="inline-form" onSubmit={submitManual}>
          <input
            value={manualBarcode}
            inputMode="numeric"
            placeholder="Input barcode manual"
            onChange={(event) => setManualBarcode(event.target.value)}
          />
          <button className="primary-btn">Pakai</button>
        </form>
      </section>
    </div>
  );
}

export default BarcodeScanner;
