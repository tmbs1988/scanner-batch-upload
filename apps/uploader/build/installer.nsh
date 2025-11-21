; Custom NSIS script to close running app before installation
!macro customInit
  ; Kill any running instances of the app
  nsExec::ExecToLog 'taskkill /F /IM "3D Fotteknik Scanner Batch Uploader.exe"'
  Pop $0
  ; Wait a moment for processes to close
  Sleep 1000
!macroend

