/**
 * ImageModal.jsx
 * A simple full-screen modal to preview an image.
 */
export default function ImageModal({ src, onClose }) {
  if (!src) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', cursor: 'pointer'
      }}
      onClick={onClose}
    >
      <img
        src={src}
        alt="Preview"
        style={{
          maxWidth: '100%', maxHeight: '100%',
          objectFit: 'contain',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking the image itself
      />
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '1.5rem', right: '2rem',
          background: 'rgba(255,255,255,0.2)', border: 'none',
          color: '#fff', fontSize: '1.5rem', width: '40px', height: '40px',
          borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        &times;
      </button>
    </div>
  )
}
