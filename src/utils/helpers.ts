import CryptoJS from 'crypto-js'
import {
  decryptFromKeystore as _decryptFromKeystore,
  Keystore as xchainKeystore,
} from '@xchainjs/xchain-crypto'


const getMasterSeedPhrase = async (
  masterPassword: string,
  masterKeystore: any
): Promise<string> => {
  return decryptFromKeystore(masterKeystore, masterPassword)
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

  public static from = async (masterPassword: string, masterKeyStore: any) => {
    const masterSeedPhrase = await getMasterSeedPhrase(masterPassword, masterKeyStore)

    return new WalletDecryptor(masterSeedPhrase);
  };


  getSeedPhrase = async (
    walletKeystore: any
  ): Promise<string> => {
    const { ed25519 } = walletKeystore.publickeys
    const pubKey = walletKeystore.publickeys.ed25519.pubKey.data || Array.from(ed25519.toBuffer())
    return decryptFromKeystore(walletKeystore, hashStringValue(`${this.masterSeedPhrase}${pubKey.toString()}`))
  }
}
