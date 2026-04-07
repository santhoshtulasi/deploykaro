$env:PATH = "C:\nvm4w\nodejs;" + $env:PATH
$Job = Start-Job { $env:PATH = "C:\nvm4w\nodejs;" + $env:PATH; cd d:\deploykaro\frontend; npm run start }
Start-Sleep -Seconds 10
npx playwright test --reporter=list > pw-out.txt 2>&1
Stop-Job $Job
Remove-Job $Job
