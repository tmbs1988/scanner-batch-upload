; Custom NSIS script to close running app before installation
!macro customInit
  ; Try graceful close first
  nsExec::ExecToLog 'taskkill /IM "3D Fotteknik Scanner Batch Uploader.exe"'
  Pop $0
  Sleep 2000
  ; Force kill if still running
  nsExec::ExecToLog 'taskkill /F /IM "3D Fotteknik Scanner Batch Uploader.exe"'
  Pop $0
  Sleep 1000
!macroend

; Don't run app after finish during auto-update
!macro customInstall
  ; Check if this is an auto-update (old version exists)
  ${If} ${FileExists} "$INSTDIR\app-update.yml"
    ; This is an update - write flag to start hidden
    CreateDirectory "$LOCALAPPDATA\scanner-batch-uploader"
    FileOpen $0 "$LOCALAPPDATA\scanner-batch-uploader\.just-updated" w
    FileClose $0
  ${EndIf}
!macroend

