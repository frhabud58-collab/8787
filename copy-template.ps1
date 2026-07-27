$src = "C:\Users\Al Jazeera\Downloads\uf,]\dist-backup\dist"
$dst = "C:\Users\Al Jazeera\Downloads\uf,]\public\template-atbawi"

# Clean destination
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }

# Copy root files
New-Item -ItemType Directory -Force -Path $dst | Out-Null
Get-ChildItem $src -File | ForEach-Object { Copy-Item $_.FullName (Join-Path $dst $_.Name) -Force }

# Copy assets
$assetsSrc = Join-Path $src "assets"
$assetsDst = Join-Path $dst "assets"
if (Test-Path $assetsSrc) {
    New-Item -ItemType Directory -Force -Path $assetsDst | Out-Null
    Get-ChildItem $assetsSrc -File | ForEach-Object { Copy-Item $_.FullName (Join-Path $assetsDst $_.Name) -Force }
}

# Copy icons
$iconsSrc = Join-Path $src "icons"
$iconsDst = Join-Path $dst "icons"
if (Test-Path $iconsSrc) {
    New-Item -ItemType Directory -Force -Path $iconsDst | Out-Null
    Get-ChildItem $iconsSrc -File | ForEach-Object { Copy-Item $_.FullName (Join-Path $iconsDst $_.Name) -Force }
}

Write-Host "Done!"
Get-ChildItem $dst -Recurse | Select-Object FullName, Length
