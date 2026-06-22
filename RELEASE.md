# Publicar TrilhaDev na Play Store

## 1. Build do app web + sync pro Android

Os assets web (`client/dist`) **não** vão pro git — são regerados a cada release.
Sempre rode antes de gerar o AAB:

```bash
cd client && npm run build && cd ..
npx cap copy android
```

## 2. Assinatura de release (só na 1ª vez)

A Play Store **rejeita** app assinado com debug key. Gere um keystore de upload:

```bash
cd android
keytool -genkey -v -keystore araradev-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias araradev
```

Guarde o `.jks` e as senhas em local seguro (perder = não consegue mais atualizar o app).
Crie `android/keystore.properties` (copie de `keystore.properties.example`):

```properties
storeFile=../araradev-release.jks
storePassword=...
keyAlias=araradev
keyPassword=...
```

`keystore.properties`, `*.jks` e `*.keystore` estão no `.gitignore` — nunca commitar.
Com esse arquivo presente, o `bundleRelease` assina automaticamente com a release key.

> Recomendado: ativar **Play App Signing** no console — o Google guarda a chave de
> assinatura final e você só envia a chave de upload.

## 3. Gerar o AAB pra subir

```bash
cd android
./gradlew bundleRelease
# saída: android/app/build/outputs/bundle/release/app-release.aab
```

Suba o `.aab` no Google Play Console.

## 4. A cada nova versão

Bumpe em `android/app/build.gradle`:
- `versionCode` → +1 (obrigatório, inteiro crescente)
- `versionName` → ex "1.1"

Depois repita passos 1 e 3.

## Pendências de segurança (recomendado antes de produção)

- **API em HTTP texto plano** (`client/src/lib/api.ts` → `http://80.241.218.217:3008`):
  login/senha trafegam sem TLS. Migrar a API pra **HTTPS** e remover
  `usesCleartextTraffic`/`cleartext`/`androidScheme: http` do `capacitor.config.json`.
