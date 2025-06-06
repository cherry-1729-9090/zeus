#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(LndMobileTools, RCTEventEmitter)

RCT_EXTERN_METHOD(
  writeConfig: (NSString *)config
  lndDir: (NSString *)lndDir
  resolver: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  log: (NSString *)level
  tag: (NSString *)tag
  msg: (NSString *)msg
)

RCT_EXTERN_METHOD(
  DEBUG_getWalletPasswordFromKeychain: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  saveChannelsBackup: (NSString *)base64Backups
  resolver: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)


RCT_EXTERN_METHOD(
  saveChannelBackupFile: (NSString)network
  resolver: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  checkICloudEnabled: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  DEBUG_listFilesInDocuments: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  DEBUG_listFilesInApplicationSupport: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  DEBUG_deleteSpeedloaderLastrunFile: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  DEBUG_deleteSpeedloaderDgraphDirectory: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  deleteLndDirectory: (NSString)lndDir
  resolver: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  DEBUG_deleteNeutrinoFiles: (NSString)network
  resolver: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  checkApplicationSupportExists: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  checkLndFolderExists: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  createIOSApplicationSupportAndLndDirectories: (NSString)lndDir
  resolver: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  excludeLndICloudBackup: (NSString)lndDir
  resolver: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  TEMP_moveLndToApplicationSupport: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  tailLog: (NSInteger)numberOfLines
  lndDir: (NSString)lndDir
  network: (NSString)network
  resolver: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  observeLndLogFile: (NSString)lndDir
  network: (NSString)network
  resolver: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  macosOpenFileDialog: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  killLnd: (RCTPromiseResolveBlock)resolve
  rejecter: (RCTPromiseRejectBlock)reject
)

@end
