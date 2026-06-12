import { execFile } from 'child_process'

export interface UIAInfo {
  name: string
  controlType: string
  className: string
  automationId: string
  helpText: string
  isEnabled: boolean
  boundingRect: { x: number; y: number; width: number; height: number } | null
  ancestors: { name: string; controlType: string; className: string }[]
  error?: string
}

export async function getElementAtPoint(x: number, y: number): Promise<UIAInfo> {
  const px = Math.round(x)
  const py = Math.round(y)

  const psScript = `
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type -AssemblyName WindowsBase
try {
  $point = [System.Windows.Point]::new(${px}, ${py})
  $element = [System.Windows.Automation.AutomationElement]::FromPoint($point)
  if ($null -eq $element) {
    Write-Output "ERROR:No element found at (${px}, ${py})"
    exit 1
  }

  # Drill down to deepest control element at this point
  $walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker
  $drill = $element
  $drillDone = $false
  while (-not $drillDone) {
    $drillDone = $true
    $child = $walker.GetFirstChild($drill)
    while ($child -ne $null) {
      try {
        $cb = $child.Current.BoundingRectangle
        if (($cb.Left -le ${px}) -and ($cb.Right -ge ${px}) -and ($cb.Top -le ${py}) -and ($cb.Bottom -ge ${py})) {
          $drill = $child
          $drillDone = $false
          break
        }
      } catch { }
      $child = $walker.GetNextSibling($child)
    }
  }
  $element = $drill

  # Core properties
  $name = $element.Current.Name
  if ($null -eq $name) { $name = "" }
  $name = $name -replace '\r?\n', ' ' -replace ':', ';'
  $controlType = $element.Current.ControlType.ProgrammaticName
  $className = $element.Current.ClassName
  if ($null -eq $className) { $className = "" }
  $automationId = $element.Current.AutomationId
  if ($null -eq $automationId) { $automationId = "" }
  $helpText = $element.Current.HelpText
  if ($null -eq $helpText) { $helpText = "" }
  $helpText = $helpText -replace '\r?\n', ' ' -replace ':', ';'
  $isEnabled = $element.Current.IsEnabled
  $rect = $element.Current.BoundingRectangle

  Write-Output "OK"
  Write-Output "Name:$name"
  Write-Output "ControlType:$controlType"
  Write-Output "ClassName:$className"
  Write-Output "AutomationId:$automationId"
  Write-Output "HelpText:$helpText"
  Write-Output "IsEnabled:$isEnabled"
  Write-Output "Rect:$($rect.Left),$($rect.Top),$($rect.Width),$($rect.Height)"

  # Walk up ancestors (up to 6 levels)
  $parent = [System.Windows.Automation.TreeWalker]::RawViewWalker.GetParent($element)
  $level = 0
  while ($null -ne $parent -and $level -lt 6) {
    $pname = $parent.Current.Name
    if ($null -eq $pname) { $pname = "" }
    $pname = $pname -replace '\r?\n', ' ' -replace ':', ';'
    $pcontrol = $parent.Current.ControlType.ProgrammaticName
    $pclass = $parent.Current.ClassName
    if ($null -eq $pclass) { $pclass = "" }
    Write-Output "Ancestor:$pname|$pcontrol|$pclass"
    $parent = [System.Windows.Automation.TreeWalker]::RawViewWalker.GetParent($parent)
    $level++
  }
} catch {
  Write-Output "ERROR:$($_.Exception.Message)"
}
`

  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', psScript],
      { timeout: 5000, windowsHide: true },
      (error, stdout, _stderr) => {
        if (error) {
          resolve(makeError(`PowerShell: ${error.message}`))
          return
        }

        const lines = stdout.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0)

        if (lines.length === 0 || lines[0] !== 'OK') {
          resolve(makeError(lines[0] || 'Unknown error'))
          return
        }

        const result: UIAInfo = {
          name: '',
          controlType: '',
          className: '',
          automationId: '',
          helpText: '',
          isEnabled: false,
          boundingRect: null,
          ancestors: []
        }

        for (const line of lines) {
          const colonIdx = line.indexOf(':')
          if (colonIdx < 0) continue
          const key = line.substring(0, colonIdx)
          const value = line.substring(colonIdx + 1)

          switch (key) {
            case 'Name': result.name = value; break
            case 'ControlType': result.controlType = value.replace('ControlType.', ''); break
            case 'ClassName': result.className = value; break
            case 'AutomationId': result.automationId = value; break
            case 'HelpText': result.helpText = value; break
            case 'IsEnabled': result.isEnabled = value === 'True'; break
            case 'Rect': {
              const parts = value.split(',')
              if (parts.length === 4) {
                result.boundingRect = {
                  x: parseFloat(parts[0]),
                  y: parseFloat(parts[1]),
                  width: parseFloat(parts[2]),
                  height: parseFloat(parts[3])
                }
              }
              break
            }
            case 'Ancestor': {
              const parts = value.split('|')
              if (parts.length >= 3) {
                result.ancestors.push({
                  name: parts[0],
                  controlType: parts[1].replace('ControlType.', ''),
                  className: parts[2]
                })
              }
              break
            }
          }
        }

        resolve(result)
      }
    )
  })
}

function makeError(msg: string): UIAInfo {
  return {
    name: '',
    controlType: '',
    className: '',
    automationId: '',
    helpText: '',
    isEnabled: false,
    boundingRect: null,
    ancestors: [],
    error: msg
  }
}

export function formatUIAInfo(info: UIAInfo): string {
  if (info.error) {
    return `不可用: ${info.error}`
  }

  const parts: string[] = []

  // Element name + type
  const labels: string[] = []
  if (info.name) labels.push(`"${info.name}"`)
  if (info.controlType) labels.push(info.controlType)
  if (info.className) labels.push(info.className)
  if (info.automationId) labels.push(`#${info.automationId}`)
  if (labels.length > 0) parts.push(labels.join(' '))

  // Ancestry breadcrumb
  if (info.ancestors.length > 0) {
    const crumbs = info.ancestors
      .filter(a => a.name || a.controlType !== 'Pane')
      .map(a => {
        let s = a.controlType || ''
        if (a.name) s = `"${a.name}" ${s}`
        return s
      })
      .filter(s => s.length > 0)
    if (crumbs.length > 0) {
      parts.push(`位于: ${crumbs.join(' > ')}`)
    }
  }

  if (parts.length === 0) parts.push('(空元素)')
  return parts.join(' | ')
}
