$ErrorActionPreference = "Stop"
$videoDir = Join-Path $PSScriptRoot "..\apps\web\public\videos"
$required = @(
  "big-buck-bunny.mp4",
  "sintel.mp4",
  "elephants-dream.mp4",
  "tears-of-steel.mp4",
  "spring.mp4",
  "sprite-fright.mp4",
  "charge.mp4",
  "cosmos-laundromat.mp4"
)
if (-not (Test-Path $videoDir)) {
  New-Item -ItemType Directory -Path $videoDir -Force | Out-Null
}
$missing = @()
foreach ($name in $required) {
  $path = Join-Path $videoDir $name
  if (-not (Test-Path $path)) {
    Write-Host "[MISSING] $name" -ForegroundColor Yellow
    $missing += $name
  } else {
    $file = Get-Item $path
    if ($file.Length -lt 100000) {
      Write-Host "[CHECK]   $name is unusually small ($($file.Length) bytes); verify it is a real MP4." -ForegroundColor Yellow
      $missing += $name
    } else {
      Write-Host "[OK]      $name ($([math]::Round($file.Length / 1MB, 1)) MB)" -ForegroundColor Green
    }
  }
}
if ($missing.Count -gt 0) {
  Write-Host "`n$($missing.Count) file(s) need attention. See docs/MEDIA_SETUP.md." -ForegroundColor Yellow
  exit 1
}
Write-Host "`nAll eight expected video files are present. Browser playback still needs to be tested." -ForegroundColor Green
