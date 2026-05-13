export default function ViewerControls({
  depthScale,
  onDepthScaleChange,
  invert,
  onInvertChange,
  onReset,
}) {
  return (
    <div className="viewer-controls">
      <label className="control-row">
        <span>Depth</span>
        <input
          type="range"
          min="0"
          max="1.5"
          step="0.01"
          value={depthScale}
          onChange={(e) => onDepthScaleChange(parseFloat(e.target.value))}
        />
        <span className="control-value">{depthScale.toFixed(2)}</span>
      </label>

      <label className="control-row">
        <span>Invert</span>
        <input
          type="checkbox"
          checked={invert}
          onChange={(e) => onInvertChange(e.target.checked)}
        />
        <span className="control-hint">
          {invert ? 'dark = raised' : 'bright = raised'}
        </span>
      </label>

      <button className="ghost-btn small" onClick={onReset}>
        Reset view
      </button>
    </div>
  );
}
