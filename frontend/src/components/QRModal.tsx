import { Modal } from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";

export function QRModal({
  show,
  onHide,
  value
}: {
  show: boolean;
  onHide: () => void;
  value: string;
}) {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>QR de ubicacion</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <QRCodeSVG value={value} size={220} />
      </Modal.Body>
    </Modal>
  );
}

