Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:\Users\panch\.gemini\antigravity-ide\brain\c5b657cf-3ec3-482b-899b-d44f8325e7d1\.user_uploaded\media_1789633137853.jpg')

for ($y = 400; $y -lt 470; $y++) {
    $p = $img.GetPixel(100, $y)
    if ($p.R -gt 250 -and $p.G -gt 250 -and $p.B -gt 250) {
        Write-Host "White pixel at y = $y"
    } else {
        Write-Host "Non-white ($($p.R),$($p.G),$($p.B)) at y = $y"
    }
}
$img.Dispose()
