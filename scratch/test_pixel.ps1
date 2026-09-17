Add-Type -AssemblyName System.Drawing
$file = 'C:\Users\panch\.gemini\antigravity-ide\brain\c5b657cf-3ec3-482b-899b-d44f8325e7d1\.user_uploaded\media_1789630308887.png'
$bmp = New-Object System.Drawing.Bitmap($file)

for ($x = 425; $x -le 435; $x += 2) {
    for ($y = 18; $y -le 30; $y += 2) {
        $c = $bmp.GetPixel($x, $y)
        Write-Host "x=$x y=$y : R=$($c.R) G=$($c.G) B=$($c.B)"
    }
}
$bmp.Dispose()
