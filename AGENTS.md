# TrilhaDev — contexto pra IA

> Rebrand 2026-06-22: nome exibido **AraraDev → TrilhaDev** (mascote arara mantido).
> appId/package **com.araradev.app → com.trilhadev.app**. Infra mantém nomes antigos
> de propósito: banco `araradev`, paths `/var/www/araradev`, keystore
> `araradev-release.jks`, arquivos `logoararadev.jpeg`, repo `github.com/Lucasmagdev/araradev`.

App React (client) + API + Capacitor Android. Roda no Android Studio pra teste
e vai pra **Play Store**. Toda mudança deve considerar o impacto na publicação,
não só "funciona no navegador".

## Regras que afetam publicação

1. **appId `com.trilhadev.app` é definitivo.** Mudar = app novo na Play Store
   (perde reviews, instalações, histórico). Nunca alterar sem confirmar com o usuário.

2. **HTTP em texto plano é débito técnico conhecido** (`capacitor.config.json`
   com `cleartext: true` / `androidScheme: http`, API em `http://...`).
   Não criar novas chamadas/feature que aprofundem dependência de HTTP puro.
   Ver pendência em `RELEASE.md`.

3. **Nunca commitar segredo de assinatura**: `keystore.properties`, `*.jks`,
   `*.keystore` (já no `.gitignore`). Não criar outro arquivo de credencial fora
   desse padrão.

4. **`versionCode`/`versionName`** (`android/app/build.gradle`) só sobem na
   hora de gerar release real — não bump em todo commit.

5. **Nova permissão Android** (AndroidManifest, plugin Capacitor que pede
   câmera/localização/storage/etc): avisar o usuário antes. Play Store revisa
   permissão sensível sem justificativa clara e pode rejeitar.

6. **`minSdkVersion`/`targetSdkVersion`**: Play Store exige `targetSdk` recente
   (atualiza ~1x/ano). Não travar/baixar versão sem necessidade.

7. **`client/dist` não vai pro git** — gerado a cada build. Antes de testar no
   Android Studio:
   ```bash
   cd client && npm run build && cd ..
   npx cap copy android
   ```
   Plugin nativo novo → `npx cap sync android` + testar no Android Studio antes
   de considerar tarefa concluída.

8. **Login/dados de usuário/analytics/ads**: Play Store exige política de
   privacidade + formulário "Data safety". Se feature tocar nisso, avisar antes
   de implementar — não é só código, tem processo no Console.

## Onde olhar

- `RELEASE.md` — passo a passo de build/assinatura/publicação + pendências.
- `decisoes.md` — log de decisões de produto/roadmap.
