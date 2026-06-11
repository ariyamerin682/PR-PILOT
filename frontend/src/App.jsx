import { useState } from 'react'

function App() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle, analyzing, approval_needed, executing, success, error
  const [errorMsg, setErrorMsg] = useState('')
  
  const [issue, setIssue] = useState(null)
  const [plan, setPlan] = useState(null)
  const [result, setResult] = useState(null)

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!url) return
    setStatus('analyzing')
    setErrorMsg('')
    
    try {
      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issue_url: url })
      })
      if (!res.ok) throw new Error(await res.text())
      
      const data = await res.json()
      setIssue(data.issue)
      setPlan(data.plan)
      setStatus('approval_needed')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to analyze issue')
      setStatus('error')
    }
  }

  const handleExecute = async () => {
    setStatus('executing')
    setErrorMsg('')
    
    try {
      const res = await fetch('http://127.0.0.1:8000/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_url: url,
          plan: Array.isArray(plan.plan) ? plan.plan.join('\n') : plan.plan,
          target_file: plan.target_file
        })
      })
      if (!res.ok) throw new Error(await res.text())
      
      const data = await res.json()
      setResult(data)
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message || 'Failed to execute plan')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <div className="max-w-4xl mx-auto px-6 py-16">
        
        <header className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-2xl mb-4 border border-purple-500/20 ring-1 ring-white/5 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)]">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">PR Pilot</h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">Your autonomous GitLab merge-request copilot. Paste an issue to generate a plan and patch.</p>
        </header>

        <main className="space-y-8">
          
          {/* Input Section */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <form onSubmit={handleAnalyze} className="relative flex gap-3 bg-neutral-900 p-2 rounded-2xl ring-1 ring-white/10 shadow-2xl">
              <input
                type="url"
                required
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://gitlab.com/username/project/-/issues/1"
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder-neutral-500 outline-none rounded-xl"
                disabled={status === 'analyzing' || status === 'executing'}
              />
              <button
                type="submit"
                disabled={status === 'analyzing' || status === 'executing'}
                className="bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-neutral-200 focus:ring-4 focus:ring-white/20 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {status === 'analyzing' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Analyzing...
                  </>
                ) : 'Analyze Issue'}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {errorMsg}
            </div>
          )}

          {/* Plan View (Approval Needed) */}
          {status === 'approval_needed' && issue && plan && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 border-b border-neutral-800 space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{issue.title}</h2>
                  <div className="text-sm text-neutral-400">Issue reported by <span className="text-white">@{issue.author}</span></div>
                </div>
                
                <div className="bg-neutral-950 rounded-2xl p-6 border border-neutral-800/50">
                  <div className="flex items-center gap-2 mb-4 text-purple-400 text-sm font-medium uppercase tracking-wider">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Proposed Plan
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">{plan.summary}</h3>
                  <div className="text-neutral-400 mb-6 text-sm bg-neutral-900 inline-block px-3 py-1 rounded-lg border border-neutral-800">
                    Target File: <code className="text-purple-300 font-mono">{plan.target_file}</code>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    {Array.isArray(plan.plan) ? plan.plan.join('\n') : plan.plan}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-neutral-900/50 flex items-center justify-end gap-4">
                <button 
                  onClick={() => { setStatus('idle'); setIssue(null); setPlan(null); }}
                  className="px-6 py-2.5 rounded-xl font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Reject & Restart
                </button>
                <button 
                  onClick={handleExecute}
                  className="px-6 py-2.5 rounded-xl font-medium bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_20px_-5px_rgba(147,51,234,0.5)] transition-all"
                >
                  Approve & Execute Patch
                </button>
              </div>
            </div>
          )}

          {/* Executing State */}
          {status === 'executing' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-500">
              <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full mb-6 relative">
                <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin"></div>
                <svg className="w-8 h-8 text-purple-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Executing Plan</h3>
              <p className="text-neutral-400">Generating patch, branching, and creating merge request...</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && result && (
            <div className="bg-neutral-900 border border-green-500/30 rounded-3xl overflow-hidden shadow-[0_0_40px_-10px_rgba(34,197,94,0.2)] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 text-center border-b border-neutral-800">
                <div className="inline-flex items-center justify-center p-3 bg-green-500/10 text-green-400 rounded-full mb-4 ring-1 ring-green-500/20">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Merge Request Created!</h2>
                <p className="text-neutral-400">The patch has been successfully generated and pushed.</p>
              </div>
              <div className="p-6 bg-neutral-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <div className="text-sm text-neutral-500 mb-1">Branch</div>
                  <code className="text-neutral-300 bg-neutral-950 px-2 py-1 rounded border border-neutral-800 font-mono text-sm">{result.branch}</code>
                </div>
                <a 
                  href={result.mr_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-xl font-medium bg-white text-black hover:bg-neutral-200 transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  View Merge Request
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

export default App
