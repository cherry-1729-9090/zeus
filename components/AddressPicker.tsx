import * as React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { ListItem } from 'react-native-elements';
import { inject, observer } from 'mobx-react';
import { chain } from 'lodash';

import Amount from './Amount';
import Button from './Button';
import Header from './Header';
import LoadingIndicator from './LoadingIndicator';
import Screen from './Screen';

import { localeString } from '../utils/LocaleUtils';
import { themeColor } from '../utils/ThemeUtils';
import AddressUtils from '../utils/AddressUtils';

import MessageSignStore from '../stores/MessageSignStore';

interface AddressPickerProps {
    navigation: any;
    route: any;
    onValueChange?: (address: string) => void;
    selectedAddress?: string;
    MessageSignStore: MessageSignStore;
    onConfirm?: (address: string) => void;
    onBack?: () => void;
}

interface AddressPickerState {
    selectedAddress: string;
    collapsedGroups: Record<string, boolean>;
}

interface Address {
    address: string;
    type: string;
    accountName?: string;
    addressType?: string;
    isInternal?: boolean;
    balance?: string;
}

interface AddressGroup {
    accountName: string;
    addressType: string;
    changeAddresses: boolean;
    addresses: Address[];
}

@inject('MessageSignStore')
@observer
export default class AddressPicker extends React.Component<
    AddressPickerProps,
    AddressPickerState
> {
    state = {
        selectedAddress: this.props.selectedAddress || '',
        collapsedGroups: {} as Record<string, boolean>
    };

    componentDidMount() {
        const { MessageSignStore } = this.props;
        if (MessageSignStore.addresses.length === 0) {
            MessageSignStore.loadAddresses();
        }
    }

    selectAddress = (address: string) => {
        const { selectedAddress } = this.state;

        const newAddress = selectedAddress === address ? '' : address;

        this.setState({ selectedAddress: newAddress });

        if (this.props.onValueChange) {
            this.props.onValueChange(newAddress);
        }
    };

    toggleGroupCollapse = (groupId: string) => {
        this.setState((prevState) => ({
            collapsedGroups: {
                ...prevState.collapsedGroups,
                [groupId]: !prevState.collapsedGroups[groupId]
            }
        }));
    };

    confirmSelection = () => {
        const { selectedAddress } = this.state;
        const { onConfirm, navigation, route } = this.props;

        if (onConfirm) {
            onConfirm(selectedAddress);
            return;
        }

        const {
            returnToScreen,
            navigationMethod = 'navigate',
            returnParams = {}
        } = route?.params || {};

        if (returnToScreen) {
            navigation[navigationMethod](returnToScreen, {
                ...returnParams,
                selectedAddress,
                timestamp: Date.now()
            });
        } else {
            navigation.goBack();
        }
    };

    handleBackPress = () => {
        const { onBack, navigation, route } = this.props;

        if (onBack) {
            onBack();
            return;
        }

        const {
            returnToScreen,
            navigationMethod = 'navigate',
            returnParams = {}
        } = route?.params || {};

        if (returnToScreen) {
            navigation[navigationMethod](returnToScreen, {
                ...returnParams,
                timestamp: Date.now()
            });
        } else {
            navigation.goBack();
        }
    };

    renderAddressGroup = ({ item }: { item: AddressGroup }) => {
        const { selectedAddress, collapsedGroups } = this.state;
        const groupId = `${item.accountName}-${item.addressType}`;
        const isCollapsed = !!collapsedGroups[groupId];

        return (
            <React.Fragment key={groupId}>
                <ListItem
                    containerStyle={{
                        borderTopWidth: 2,
                        borderBottomWidth: 1,
                        borderColor: themeColor('secondaryText'),
                        backgroundColor: 'transparent'
                    }}
                    onPress={() => this.toggleGroupCollapse(groupId)}
                >
                    <ListItem.Content>
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <View style={{ marginRight: 10 }}>
                                {!isCollapsed ? (
                                    <Text
                                        style={{
                                            color: themeColor('text'),
                                            fontSize: 18
                                        }}
                                    >
                                        ▼
                                    </Text>
                                ) : (
                                    <Text
                                        style={{
                                            color: themeColor('text'),
                                            fontSize: 18
                                        }}
                                    >
                                        ▶
                                    </Text>
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <ListItem.Title
                                    style={{
                                        color: themeColor('text'),
                                        fontSize: 14
                                    }}
                                >
                                    {localeString('general.accountName')}:{' '}
                                    {item.accountName + '\n'}
                                    {localeString('general.addressType')}:{' '}
                                    {AddressUtils.snakeToHumanReadable(
                                        item.addressType
                                    )}
                                    {' \n'}
                                    {localeString('general.count')}:{' '}
                                    {item.addresses.length}
                                    {item.changeAddresses &&
                                        '\n' +
                                            localeString(
                                                'views.OnChainAddresses.changeAddresses'
                                            )}
                                </ListItem.Title>
                            </View>
                        </View>
                    </ListItem.Content>
                </ListItem>

                {!isCollapsed &&
                    item.addresses.map((address: Address) => (
                        <ListItem
                            key={`address-${address.address}`}
                            containerStyle={{
                                borderBottomWidth: 0,
                                backgroundColor:
                                    address.address === selectedAddress
                                        ? themeColor('highlight') + '30' // 30% opacity
                                        : 'transparent'
                            }}
                            onPress={() => this.selectAddress(address.address)}
                        >
                            <ListItem.Content>
                                {address.balance !== undefined && (
                                    <Amount sats={address.balance} sensitive />
                                )}
                                <ListItem.Subtitle
                                    style={{
                                        color: themeColor('secondaryText'),
                                        fontSize: 14
                                    }}
                                >
                                    {address.address}
                                </ListItem.Subtitle>
                            </ListItem.Content>
                            {address.address === selectedAddress && (
                                <View style={{ marginLeft: 10 }}>
                                    <Text
                                        style={{
                                            color: themeColor('highlight'),
                                            fontSize: 16
                                        }}
                                    >
                                        ✓
                                    </Text>
                                </View>
                            )}
                        </ListItem>
                    ))}
            </React.Fragment>
        );
    };

    render() {
        const { MessageSignStore, navigation } = this.props;
        const { addresses, loading } = MessageSignStore;
        const { selectedAddress } = this.state;

        let addressGroups: AddressGroup[] = [];

        if (addresses && addresses.length > 0) {
            const groupedAddresses = chain(addresses)
                .groupBy(function (addr: Address) {
                    const accountName =
                        addr.accountName ||
                        localeString('general.defaultNodeNickname');
                    const addressType =
                        addr.addressType || localeString('general.unknown');
                    const isInternal =
                        addr.isInternal !== undefined
                            ? String(addr.isInternal)
                            : 'false';
                    return `${accountName};${addressType};${isInternal}`;
                })
                .value();

            addressGroups = Object.entries(groupedAddresses).map(
                ([key, addrGroup]) => {
                    const [accountName, addressType, isInternalStr] =
                        key.split(';');
                    return {
                        accountName:
                            accountName ||
                            localeString('general.defaultNodeNickname'),
                        addressType:
                            addressType || localeString('general.unknown'),
                        changeAddresses: isInternalStr === 'true',
                        addresses: addrGroup
                    };
                }
            );
        }

        return (
            <Screen>
                <Header
                    leftComponent={{
                        icon: 'arrow-back',
                        color: themeColor('text'),
                        onPress: this.handleBackPress
                    }}
                    centerComponent={{
                        text: localeString(
                            'views.Settings.SignMessage.selectAddress'
                        ),
                        style: {
                            color: themeColor('text'),
                            fontFamily: 'PPNeueMontreal-Book'
                        }
                    }}
                    navigation={navigation}
                />

                <View style={styles.container}>
                    {loading ? (
                        <LoadingIndicator />
                    ) : (
                        <>
                            {addressGroups.length > 0 ? (
                                <FlatList
                                    data={addressGroups}
                                    renderItem={this.renderAddressGroup}
                                    keyExtractor={(_item, index) =>
                                        `group-${index}`
                                    }
                                />
                            ) : (
                                <Text
                                    style={{
                                        color: themeColor('text'),
                                        textAlign: 'center',
                                        marginTop: 20
                                    }}
                                >
                                    {localeString(
                                        'views.Settings.SignMessage.noAddressesAvailable'
                                    )}
                                </Text>
                            )}
                        </>
                    )}

                    <View style={styles.buttonContainer}>
                        <Button
                            title={localeString('general.confirm')}
                            onPress={this.confirmSelection}
                            disabled={!selectedAddress}
                        />
                    </View>
                </View>
            </Screen>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10
    },
    buttonContainer: {
        padding: 20
    },
    text: {
        fontFamily: 'PPNeueMontreal-Book'
    }
});
