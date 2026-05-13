export default function AnalysisResult({ result }) {
  const {
    summary,
    issues = [],
    improvements = [],
    recommendedDepartment,
    keyMetrics = [],
    disclaimer,
    _modelUsed,
  } = result;

  return (
    <div className="card">
      <div className="result-header">
        <h2>Analysis</h2>
        {_modelUsed && <span className="result-meta">{_modelUsed.split('/').pop().replace(':free', '')}</span>}
      </div>

      {summary && (
        <div className="section">
          <h3 className="section-title">Summary</h3>
          <p className="summary">{summary}</p>
        </div>
      )}

      {recommendedDepartment && (
        <div className="section">
          <h3 className="section-title">Recommended specialist</h3>
          <div className="dept-card">
            <div>
              <div className="dept-primary">{recommendedDepartment.primary}</div>
              {recommendedDepartment.alternatives?.length > 0 && (
                <div className="dept-alternatives">
                  Also consider: {recommendedDepartment.alternatives.join(', ')}
                </div>
              )}
            </div>
            {recommendedDepartment.urgency && (
              <span className={`urgency urgency-${recommendedDepartment.urgency}`}>
                {recommendedDepartment.urgency}
              </span>
            )}
          </div>
        </div>
      )}

      {keyMetrics.length > 0 && (
        <div className="section">
          <h3 className="section-title">Key metrics</h3>
          <table className="metrics-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {keyMetrics.map((m, i) => (
                <tr key={i}>
                  <td>{m.name}</td>
                  <td>{m.value}</td>
                  <td>
                    <span className={`status status-${m.status}`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {issues.length > 0 && (
        <div className="section">
          <h3 className="section-title">Findings</h3>
          {issues.map((issue, i) => (
            <div key={i} className={`issue ${issue.severity || 'low'}`}>
              <div className="issue-head">
                <span className="issue-title">{issue.title}</span>
                {issue.severity && (
                  <span className={`severity-badge severity-${issue.severity}`}>
                    {issue.severity}
                  </span>
                )}
              </div>
              <div className="issue-detail">{issue.detail}</div>
            </div>
          ))}
        </div>
      )}

      {improvements.length > 0 && (
        <div className="section">
          <h3 className="section-title">Suggestions</h3>
          {improvements.map((imp, i) => (
            <div key={i} className="improvement">
              <div className="improvement-area">{imp.area}</div>
              <div className="improvement-text">{imp.suggestion}</div>
            </div>
          ))}
        </div>
      )}

      {disclaimer && <div className="disclaimer">{disclaimer}</div>}
    </div>
  );
}
