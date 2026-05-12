$ErrorActionPreference = 'Stop'

# Copilot Hook: PreToolUse
# Simple check: ask before tool use when payload appears to include hardcoded secrets.

function Write-AskDecision {
  param([string]$Reason)

  $out = @{
    hookSpecificOutput = @{
      hookEventName = 'PreToolUse'
      permissionDecision = 'ask'
      permissionDecisionReason = $Reason
    }
  } | ConvertTo-Json -Depth 10

  Write-Output $out
}

$raw = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($raw)) {
  exit 0
}

try {
  $payload = $raw | ConvertFrom-Json -Depth 100
} catch {
  # If payload cannot be parsed, allow execution.
  exit 0
}

$inputText = ''
if ($payload.PSObject.Properties.Name -contains 'toolInput') {
  $inputText = $payload.toolInput | ConvertTo-Json -Depth 20 -Compress
} elseif ($payload.PSObject.Properties.Name -contains 'input') {
  $inputText = $payload.input | ConvertTo-Json -Depth 20 -Compress
} else {
  $inputText = $raw
}

$patterns = @(
  '(?i)(api[_-]?key|access[_-]?key|client[_-]?secret|token|password|passwd)\s*[:=]\s*[^,\s\}\{]{6,}',
  '(?i)\b(ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z\-_]{20,}|sk-[A-Za-z0-9]{16,})\b'
)

foreach ($pattern in $patterns) {
  if ($inputText -match $pattern) {
    Write-AskDecision -Reason 'Potential hardcoded secret detected (token/key/password pattern).'
    exit 0
  }
}

exit 0
