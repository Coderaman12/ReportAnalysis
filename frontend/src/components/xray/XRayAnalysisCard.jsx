export default function XRayAnalysisCard({ result }) {
  const {
    bodyPart,
    view,
    findings = [],
    overallSeverity,
    nextStep,
    imageInterpretation,
    confidence,
    disclaimer,
    _modelUsed,
  } = result;

  return (
    <div className="card xray-sidebar">
      <div className="result-header">
        <h2>Analysis</h2>
        {_modelUsed && (
          <span className="result-meta">
            {_modelUsed.split('/').pop().replace(':free', '')}
          </span>
        )}
      </div>

      {confidence && confidence !== 'high' && (
        <div className={`confidence-banner confidence-${confidence}`}>
          {confidence === 'low'
            ? 'Low-confidence analysis — treat as a rough hint only.'
            : 'Medium confidence — please confirm with a radiologist.'}
        </div>
      )}

      <div className="section">
        <h3 className="section-title">Detected body part</h3>
        <div className="dept-card">
          <div>
            <div className="dept-primary">{bodyPart || 'Unknown'}</div>
            {view && view !== 'unknown' && (
              <div className="dept-alternatives">View: {view}</div>
            )}
          </div>
          {overallSeverity && (
            <span className={`severity-badge severity-${overallSeverity}`}>
              {overallSeverity}
            </span>
          )}
        </div>
      </div>

      {findings.length > 0 && (
        <div className="section">
          <h3 className="section-title">Findings</h3>
          {findings.map((f, i) => (
            <div key={i} className={`issue ${f.severity || 'low'}`}>
              <div className="issue-head">
                <span className="issue-title">{f.title}</span>
                {f.severity && (
                  <span className={`severity-badge severity-${f.severity}`}>
                    {f.severity}
                  </span>
                )}
              </div>
              <div className="issue-detail">{f.detail}</div>
              {f.location && (
                <div className="issue-location">Location: {f.location}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {nextStep && (
        <div className="section">
          <h3 className="section-title">Next step</h3>
          <p className="summary">{nextStep}</p>
        </div>
      )}

      {imageInterpretation && (
        <div className="section">
          <h3 className="section-title">Reading the 3D view</h3>
          <div className="improvement">
            <div className="improvement-area">Bright</div>
            <div className="improvement-text">
              {imageInterpretation.brightAreasMean}
            </div>
          </div>
          <div className="improvement">
            <div className="improvement-area">Dark</div>
            <div className="improvement-text">
              {imageInterpretation.darkAreasMean}
            </div>
          </div>
          {imageInterpretation.invertedHint && (
            <div className="improvement">
              <div className="improvement-area">Inverted</div>
              <div className="improvement-text">
                This X-ray appears inverted — we've enabled invert mode so bones
                still appear raised.
              </div>
            </div>
          )}
        </div>
      )}

      {disclaimer && <div className="disclaimer">{disclaimer}</div>}
    </div>
  );
}
