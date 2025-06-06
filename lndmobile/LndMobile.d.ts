export enum ELndMobileStatusCodes {
    STATUS_SERVICE_BOUND = 1,
    STATUS_PROCESS_STARTED = 2,
    STATUS_WALLET_UNLOCKED = 4
}

export interface ILndMobile {
    // General
    initialize(): Promise<{ data: string }>;
    startLnd(
        args: string,
        lndDir: string,
        isTorEnabled?: boolean,
        isTestnet?: boolean
    ): Promise<{ data: string }>;
    stopLnd(): Promise<{ data: string }>;
    initWallet(
        seed: string[],
        password: string,
        recoveryWindow: number,
        channelBackupsBase64: string | null
    ): Promise<{ data: string }>;
    unlockWallet(password: string): Promise<{ data: string }>;

    checkStatus(): Promise<ELndMobileStatusCodes>;

    // Send gRPC LND API request
    sendCommand(
        method: string,
        base64Payload: string
    ): Promise<{ data: string }>;
    sendStreamCommand(
        method: string,
        base64Payload: string,
        streamOnlyOnce: boolean
    ): Promise<'done'>;
    sendBidiStreamCommand(
        method: string,
        streamOnlyOnce: boolean
    ): Promise<'done'>;
    writeToStream(method: string, payload: string): Promise<boolean>;

    // Express Graph Sync / Speedloader
    gossipSync(serviceUrl: string): Promise<{ data: string }>;
    cancelGossipSync(): void;

    // Android-specific
    unbindLndMobileService(): Promise<void>; // TODO(hsjoberg): function looks broken
    sendPongToLndMobileservice(): Promise<{ data: string }>;
    checkLndMobileServiceConnected(): Promise<boolean>;
    updateTranslationCache(
        locale: string,
        translations: { [key: string]: string }
    ): void;

    // Swaps
    createClaimTransaction(
        endpoint: string,
        swapId: string,
        claimLeaf: string,
        refundLeaf: string,
        privateKey: string,
        servicePubKey: string,
        transactionHash: string,
        pubNonce: string
    ): Promise<string>;

    createReverseClaimTransaction(
        endpoint: string,
        swapId: string,
        claimLeaf: string,
        refundLeaf: string,
        privateKey: string,
        servicePubKey: string,
        preimageHex: string,
        transactionHex: string,
        lockupAddress: string,
        destinationAddress: string,
        feeRate: number,
        isTestnet?: boolean
    ): Promise<string>;

    createRefundTransaction(
        endpoint: string,
        swapId: string,
        claimLeaf: string,
        refundLeaf: string,
        transactionHex: string,
        privateKey: string,
        servicePubKey: string,
        feeRate: number,
        timeoutBlockHeight: number,
        destinationAddress: string,
        lockupAddress: string,
        cooperative: boolean,
        isTestnet?: boolean
    ): Promise<string>;
}

export interface ILndMobileTools {
    writeConfig(lndDir: string, config: string): Promise<string>;
    killLnd(): Promise<boolean>;
    tailLog(
        numberOfLines: number,
        lndDir: string,
        network: string
    ): Promise<string>;
    observeLndLogFile(lndDir: string, network: string): Promise<boolean>;
    saveChannelsBackup(base64Backups: string): Promise<string>;
    saveChannelBackupFile(network: string): Promise<boolean>;
    DEBUG_getWalletPasswordFromKeychain(): Promise<string>;
    DEBUG_deleteSpeedloaderLastrunFile(): Promise<boolean>;
    DEBUG_deleteSpeedloaderDgraphDirectory(): Promise<null>;
    deleteLndDirectory(lndDir: string): Promise<null>;
    DEBUG_deleteNeutrinoFiles(network: string): Promise<boolean>;

    // Android-specific
    getIntentStringData(): Promise<string | null>;
    getIntentNfcData(): Promise<string | null>;
    DEBUG_deleteWallet(network: string): Promise<boolean>;
    DEBUG_deleteDatafolder(): Promise<null>;
    DEBUG_listProcesses(): Promise<string>;
    checkLndProcessExist(): Promise<boolean>;
    deleteTLSCerts(): Promise<boolean>;
    restartApp(): void;

    // iOS-specific
    checkICloudEnabled(): Promise<boolean>;
    checkApplicationSupportExists(): Promise<boolean>;
    checkLndFolderExists(): Promise<boolean>;
    createIOSApplicationSupportAndLndDirectories(
        lndDir: string
    ): Promise<boolean>;
    excludeLndICloudBackup(lndDir: string): Promise<boolean>;
    TEMP_moveLndToApplicationSupport(): Promise<boolean>;

    // macOS-specific
    macosOpenFileDialog(): Promise<string | undefined>;
}

export type WorkInfo =
    | 'BLOCKED'
    | 'CANCELLED'
    | 'ENQUEUED'
    | 'FAILED'
    | 'RUNNING'
    | 'SUCCEEDED'
    | 'WORK_NOT_EXIST';

export interface ILndMobileScheduledSync {
    setupScheduledSyncWork: () => Promise<boolean>;
    removeScheduledSyncWork: () => Promise<boolean>;
    checkScheduledSyncWorkStatus: () => Promise<WorkInfo>;
}

export interface IGossipFileScheduledSync {
    setupScheduledSyncWork: () => Promise<boolean>;
    removeScheduledSyncWork: () => Promise<boolean>;
    checkScheduledSyncWorkStatus: () => Promise<WorkInfo>;
}

declare module 'react-native' {
    interface NativeModulesStatic {
        LndMobile: ILndMobile;
        LndMobileTools: ILndMobileTools;
        LndMobileScheduledSync: ILndMobileScheduledSync;
        GossipFileScheduledSync: IGossipFileScheduledSync;
    }
}
