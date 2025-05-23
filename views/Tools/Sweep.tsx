import * as React from 'react';
import {
    NativeModules,
    NativeEventEmitter,
    StyleSheet,
    Text,
    View,
    ScrollView
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { Route } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import BalanceStore from '../../stores/BalanceStore';
import InvoicesStore from '../../stores/InvoicesStore';
import ModalStore from '../../stores/ModalStore';
import NodeInfoStore from '../../stores/NodeInfoStore';
import SettingsStore from '../../stores/SettingsStore';
import TransactionsStore from '../../stores/TransactionsStore';

import Amount from '../../components/Amount';
import Button from '../../components/Button';
import { WarningMessage } from '../../components/SuccessErrorMessage';
import Header from '../../components/Header';
import OnchainFeeInput from '../../components/OnchainFeeInput';
import Screen from '../../components/Screen';
import TextInput from '../../components/TextInput';

import AddressUtils from '../../utils/AddressUtils';
import { localeString } from '../../utils/LocaleUtils';
import { themeColor } from '../../utils/ThemeUtils';

import TransactionRequest from '../../models/TransactionRequest';

interface SweepProps {
    exitSetup: any;
    navigation: StackNavigationProp<any, any>;
    BalanceStore: BalanceStore;
    InvoicesStore: InvoicesStore;
    ModalStore: ModalStore;
    NodeInfoStore: NodeInfoStore;
    TransactionsStore: TransactionsStore;
    SettingsStore: SettingsStore;
    route: Route<'Sweep', { destination: string }>;
}

interface SweepState {
    destination: string;
    isValid: boolean;
    fee: string;
}

@inject(
    'InvoicesStore',
    'ModalStore',
    'NodeInfoStore',
    'TransactionsStore',
    'BalanceStore',
    'SettingsStore'
)
@observer
export default class Sweep extends React.Component<SweepProps, SweepState> {
    listener: any;
    constructor(props: SweepProps) {
        super(props);
        const { route } = props;
        const destination = route.params?.destination;

        this.state = {
            destination: destination || '',
            isValid: true,
            fee: '2'
        };
    }

    async UNSAFE_componentWillMount() {
        if (this.listener && this.listener.stop) this.listener.stop();
    }

    UNSAFE_componentWillReceiveProps(nextProps: SweepProps) {
        this.setState({ destination: nextProps.route.params?.destination });
    }

    subscribePayment = (streamingCall: string) => {
        const { handlePayment, handlePaymentError } =
            this.props.TransactionsStore;
        const { LncModule } = NativeModules;
        const eventEmitter = new NativeEventEmitter(LncModule);
        this.listener = eventEmitter.addListener(
            streamingCall,
            (event: any) => {
                if (event.result && event.result !== 'EOF') {
                    try {
                        const result = JSON.parse(event.result);
                        if (result && result.status !== 'IN_FLIGHT') {
                            handlePayment(result);
                            this.listener = null;
                        }
                    } catch (error: any) {
                        handlePaymentError(event.result);
                        this.listener = null;
                    }
                }
            }
        );
    };

    sendCoins = () => {
        const { SettingsStore, TransactionsStore, navigation } = this.props;
        const { destination, fee } = this.state;
        const { implementation } = SettingsStore;

        let request: TransactionRequest;
        request =
            implementation === 'cln-rest'
                ? {
                      addr: destination,
                      sat_per_vbyte: fee,
                      amount: 'all',
                      spend_unconfirmed: true
                  }
                : {
                      addr: destination,
                      sat_per_vbyte: fee,
                      send_all: true,
                      spend_unconfirmed: true
                  };
        TransactionsStore.sendCoins(request);
        navigation.navigate('SendingOnChain');
    };

    handleOnNavigateBack = (fee: string) => {
        this.setState({
            fee
        });
    };

    validateAddress = (destination: string) => {
        const { NodeInfoStore } = this.props;
        const { nodeInfo } = NodeInfoStore;
        const { isTestNet, isRegTest } = nodeInfo;
        const isValid = AddressUtils.isValidBitcoinAddress(
            destination,
            isTestNet || isRegTest
        );
        this.setState({
            isValid,
            destination
        });
    };

    render() {
        const { BalanceStore, navigation } = this.props;
        const { destination, isValid, fee } = this.state;
        const { confirmedBlockchainBalance, unconfirmedBlockchainBalance } =
            BalanceStore;

        const noOnchainBalance =
            confirmedBlockchainBalance === 0 &&
            unconfirmedBlockchainBalance === 0;

        const disabled = !destination || !isValid || noOnchainBalance;

        return (
            <Screen>
                <Header
                    leftComponent="Back"
                    centerComponent={{
                        text: localeString('views.Sweep.title'),
                        style: {
                            color: themeColor('text'),
                            fontFamily: 'PPNeueMontreal-Book'
                        }
                    }}
                    navigation={navigation}
                />
                <ScrollView
                    style={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {!!destination && noOnchainBalance && (
                        <View style={{ paddingTop: 10, paddingBottom: 10 }}>
                            <WarningMessage
                                message={localeString(
                                    'views.Send.noOnchainBalance'
                                )}
                            />
                        </View>
                    )}
                    <Text
                        style={{
                            ...styles.text,
                            color: themeColor('secondaryText')
                        }}
                    >
                        {localeString('views.Transaction.destAddress')}
                    </Text>
                    <TextInput
                        placeholder={'bc1...'}
                        value={destination}
                        error={!isValid}
                        onChangeText={(text: string) => {
                            this.validateAddress(text);
                        }}
                    />

                    <React.Fragment>
                        <View style={{ paddingBottom: 15 }}>
                            <>
                                <Text
                                    style={{
                                        fontFamily: 'PPNeueMontreal-Book',
                                        color: themeColor('secondaryText')
                                    }}
                                >
                                    {`${localeString(
                                        'general.confirmed'
                                    )} ${localeString(
                                        'views.Settings.Display.DefaultView.balance'
                                    )}`}
                                </Text>
                                <Amount
                                    sats={confirmedBlockchainBalance}
                                    toggleable
                                />
                            </>
                        </View>

                        <View style={{ paddingBottom: 15 }}>
                            <>
                                <Text
                                    style={{
                                        fontFamily: 'PPNeueMontreal-Book',
                                        color: themeColor('secondaryText')
                                    }}
                                >
                                    {`${localeString(
                                        'general.unconfirmed'
                                    )} ${localeString(
                                        'views.Settings.Display.DefaultView.balance'
                                    )}`}
                                </Text>
                                <Amount
                                    sats={unconfirmedBlockchainBalance}
                                    toggleable
                                />
                            </>
                        </View>

                        <Text
                            style={{
                                ...styles.text,
                                color: themeColor('secondaryText')
                            }}
                        >
                            {localeString('views.Send.feeSatsVbyte')}:
                        </Text>

                        <OnchainFeeInput
                            fee={fee}
                            onChangeFee={(text: string) =>
                                this.setState({ fee: text })
                            }
                            navigation={navigation}
                        />

                        <Text
                            style={{
                                ...styles.text,
                                color: themeColor('secondaryText')
                            }}
                        >
                            {localeString('views.Sweep.explainer')}
                        </Text>

                        <View style={styles.button}>
                            <Button
                                title={localeString('views.Send.sendCoins')}
                                icon={
                                    !disabled && {
                                        name: 'send',
                                        size: 25
                                    }
                                }
                                onPress={() => this.sendCoins()}
                                disabled={disabled}
                            />
                        </View>
                    </React.Fragment>
                </ScrollView>
            </Screen>
        );
    }
}

const styles = StyleSheet.create({
    text: {
        fontFamily: 'PPNeueMontreal-Book'
    },
    secondaryText: {
        fontFamily: 'PPNeueMontreal-Book'
    },
    content: {
        padding: 20
    },
    button: {
        alignItems: 'center',
        paddingTop: 30
    },
    feeTableButton: {
        paddingTop: 15,
        alignItems: 'center',
        minHeight: 75
    },
    editFeeButton: {
        paddingTop: 15,
        alignItems: 'center'
    },
    label: {
        fontFamily: 'PPNeueMontreal-Book',
        paddingTop: 5
    }
});
