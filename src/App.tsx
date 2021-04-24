import './App.css';
import React, { useState, useRef, useEffect } from 'react'
import { WalletDecryptor } from './utils/helpers'

function App() {
  const[filename, setFilename] = useState('')
  const[backupFileJSON, setBackupFileJSON] = useState<any>()
  const[keyStores, setKeyStores] = useState<any>([])
  const[password, setPassword] = useState<any>([])
  const[masterKeyStore, setMasterKeyStores] = useState<any>({})
  const[seedPhrases, setSeedPhrases] = useState<any>([])
  const[error, setError] = useState<string>("")

  useEffect(() => {
    try{
      if (backupFileJSON) {
        setError("")
        setPassword("")
        setMasterKeyStores(backupFileJSON.masterKey)
        const wallets = Object.values(backupFileJSON?.accounts?.wallets)
        setKeyStores(wallets.map((wallet:any) => ({...wallet.walletInfo.data, label: wallet.label})))
      }
    } catch(e) {
      console.error(e)
    }

  }, [backupFileJSON])

  const inputRef = useRef<HTMLInputElement>(null)

  const handlerBrowse = (): void => {
    if (inputRef && inputRef.current) inputRef.current.click()
  }

  const handlerFileChange = ({ target }: React.ChangeEvent<HTMLInputElement>): void => {
    if (!target) return

    const { files } = target

    if (!files) {
      setFilename('Browse')
      return
    }

    if (files.length) {
      const file = files[0]
      setFilename(file.name)
      const fr = new FileReader()

      fr.readAsText(file)
      fr.onloadend = (e): void => {
        if (!e.target || !e.target.result) return
        try {
          const backupFile = JSON.parse(e.target.result.toString())
          setBackupFileJSON(backupFile)
          console.log(backupFile)
        } catch (err) {
          console.log(err)
        }
      }
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    WalletDecryptor.from(password, masterKeyStore).then(walletDecryptor => {
      Promise.all(keyStores.map((keyStore: any) => {
          return walletDecryptor.getSeedPhrase(keyStore).then((phrases: any) => {
            return { label: keyStore.label, phrases }
          })
        }
        )
      ).then(phrases => {
        setSeedPhrases(phrases)
        setError("")
      })
      .catch(e => {
        console.error(e)
        setSeedPhrases([])
        setError(e)
      })
    }).catch(e => {
      console.error(e)
      setSeedPhrases([])
      setError(e)
    })
  }

  return (
    <div className="App">
      <header className="App-header">
        XDEFI Backup Decryptor
      </header>
      <h2>
        Select the a backup file to be decrypted
      </h2>
      <div className="body">
        {filename===''}
        <input
          type="file"
          name="file"
          ref={inputRef}
          style={{ display: 'none' }}
          required
          onChange={handlerFileChange}
        />
        <div className="fileSelection">
          Select File <button onClick={handlerBrowse}> {filename==='' ? 'Browse Files' : filename} </button>
        </div>

        {!!keyStores.length &&
          <form onSubmit={handleSubmit}>
            <div className="password">
                Password <input placeholder='  password' onChange={e => setPassword(e.target.value)} type="password" title="password" name="password" value={password} required/>
            </div>
              <button type="submit">get account seed phrases</button>
          </form>
        }
        <div className="accounts">
          {seedPhrases.map((seedPhrase: any) => {
            return (
              <div className="account" key={seedPhrase.label}>
                {seedPhrase.label}: {seedPhrase.phrases}
              </div>
            )
          })}
        </div>
        {error !=='' && <div className="error"> {error} </div> }
      </div>
    </div>
  );
}

export default App;