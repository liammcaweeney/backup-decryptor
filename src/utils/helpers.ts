import CryptoJS from 'crypto-js'
import {
  decryptFromKeystore as _decryptFromKeystore,
  Keystore as xchainKeystore,
} from '@xchainjs/xchain-crypto'
import * as bip39 from 'bip39'

const generateMasterSeedPhrase = async (
  masterPassword: string,
  masterKeystore: any
): Promise<string> => {
  return decryptFromKeystore(masterKeystore, masterPassword)
}
export const entropyToPhrase = (entropy: string): string => {
  return bip39.entropyToMnemonic(entropy)
}

const hashStringValue = (string: string) => {
  return CryptoJS.SHA256(string).toString(CryptoJS.enc.Hex)
}

const decryptFromKeystore = async (
  keystore: any,
  password: string
): Promise<string> => {
  return  _decryptFromKeystore(
    keystore as xchainKeystore,
    password
  )
}
export class WalletDecryptor {
  private readonly masterSeedPhrase: string

  constructor(masterSeedPhrase: string) {
    this.masterSeedPhrase = masterSeedPhrase
  }

  public static fromPassword = async (masterPassword: string, masterKeyStore: any) => {
    console.log('hehre')
    const masterSeedPhrase = await generateMasterSeedPhrase(masterPassword, masterKeyStore)
    console.log('hehre2')
    return new WalletDecryptor(masterSeedPhrase);
  };

  public static fromRecoveryCode = async (recoveryCode: string) => {
    const masterSeedPhrase = await entropyToPhrase(recoveryCode)
    return new WalletDecryptor(masterSeedPhrase);
  };

  getMasterSeedPhrase = () => this.masterSeedPhrase


  getSeedPhrase = async (
    walletKeystore: any
  ): Promise<string> => {
    const { ed25519 } = walletKeystore.publickeys
    const pubKey = walletKeystore.publickeys.ed25519.pubKey.data || Array.from(ed25519.toBuffer())
    return decryptFromKeystore(walletKeystore, hashStringValue(`${this.masterSeedPhrase}${pubKey.toString()}`))
  }
}
