$body = '{"source":"A","destination":"J","optimization":"distance","blocked_roads":[],"traffic_conditions":{}}'
$r = Invoke-WebRequest -Uri 'http://localhost:8000/api/route/' -Method POST -Body $body -ContentType 'application/json' -UseBasicParsing
$d = $r.Content | ConvertFrom-Json
Write-Host "=== Route A -> J (Distance Optimization) ==="
Write-Host "Success: $($d.success)"
Write-Host "Path: $($d.path -join ' -> ')"
Write-Host "Distance: $($d.distance) km"
Write-Host "Travel Time: $($d.travel_time) min"
Write-Host "Segments: $($d.segments.Count)"
Write-Host "Alternatives: $($d.alternatives.Count)"
Write-Host ""

# Test with blocked road
$body2 = '{"source":"A","destination":"J","optimization":"distance","blocked_roads":[["B","D"]],"traffic_conditions":{}}'
$r2 = Invoke-WebRequest -Uri 'http://localhost:8000/api/route/' -Method POST -Body $body2 -ContentType 'application/json' -UseBasicParsing
$d2 = $r2.Content | ConvertFrom-Json
Write-Host "=== Route A -> J (B-D Blocked) ==="
Write-Host "Success: $($d2.success)"
Write-Host "Path: $($d2.path -join ' -> ')"
Write-Host "Distance: $($d2.distance) km"
Write-Host "Alternatives: $($d2.alternatives.Count)"
Write-Host ""

# Test traffic simulation
$body3 = '{"traffic_conditions":{"A-B":"heavy","E-F":"moderate"},"source":"A","destination":"J","optimization":"time"}'
$r3 = Invoke-WebRequest -Uri 'http://localhost:8000/api/simulate/traffic/' -Method POST -Body $body3 -ContentType 'application/json' -UseBasicParsing
$d3 = $r3.Content | ConvertFrom-Json
Write-Host "=== Traffic Simulation (A-B heavy, E-F moderate) ==="
Write-Host "Success: $($d3.success)"
Write-Host "Recommended Path: $($d3.recommended_route.path -join ' -> ')"
Write-Host "Travel Time: $($d3.recommended_route.travel_time) min"
Write-Host "Congested Roads: $(($d3.updated_roads | Where-Object {$_.is_congested}).Count)"
