# RSA + AES 混合加密实现

**核心：闭包保护**`**syncKey**`**，防止外部泄露密钥**

```javascript
const publicKey = config.rsa.publicKey
const RSA = new JSEncrypt()
RSA.setPrivateKey(publicKey)

const createSecretManger = () => {
  let syncKey

  const generateSyncKey = () => {
    syncKey = AESUtils.generateKey()
    return RSA.encrypt(syncKey)
  }

  const aesEncryptMessage = (message) => {
    if (!syncKey) {
      throw new Error('')
    }

    const aesUtils = new AESUtils(syncKey)

    return aesUtils.encrypt(message)
  }

  const rsaEncryptMessage = (message) => {
    return RSA.encrypt(JSON.stringify(message))
  }

  return {
    generateSyncKey,
    aesEncryptMessage,
    rsaEncryptMessage,
  }
}
```

![](https://cdn.nlark.com/yuque/0/2025/png/22036110/1753810796770-71766e00-2843-4b2f-b865-8383d657cee8.png)

