# Daily Task — Contexto do Projeto

App mobile de tarefas diárias + controle financeiro pessoal, em
React Native + Expo (SDK 54), com TypeScript e NativeWind (Tailwind
para React Native). Roda em iOS, Android e web.

## Decisões importantes (não reverter sem perguntar)

- **Dados 100% locais**: tudo fica salvo no AsyncStorage do aparelho.
  Sem login, sem backend, sem nuvem. Backup é manual (exportar/importar
  um arquivo .json em Configurações).
- **Sem servidor**: o app já foi migrado de uma plataforma chamada
  Manus. Não existe mais backend, banco de dados, OAuth ou tRPC no
  projeto — se aparecer algo assim, é resíduo e deve ser removido,
  não reconectado.
- **Build**: via EAS Build (serviço da Expo), não mais pela Manus.
  Configuração em `eas.json`.

## Identidade visual

- Paleta definida em `theme.config.js`: roxo (`primary`, estilo Nubank)
  + verde (`accent`, estilo Ailos). Veja esse arquivo antes de usar
  cores soltas.
- Fonte de título: Sora (via `@expo-google-fonts/sora`), aplicada com
  `style={{ fontFamily: "Sora_800ExtraBold" }}` nos títulos grandes e
  números em destaque. O resto do texto usa a fonte do sistema.
- Ícone do app já é customizado (`assets/images/icon.png` etc.) — não
  reverter para os assets padrão do template Expo.

## Estrutura

- `app/(tabs)/` — telas principais: Tarefas (`index.tsx`), Financeiro,
  Configurações
- `app/relatorios.tsx` — tela de relatórios (fora das abas)
- `components/financeiro/` — modais do Financeiro (gasto fixo, despesa,
  categoria), todos usando o casco compartilhado `bottom-sheet-modal.tsx`
  (resolve teclado cobrindo campos — sempre reutilizar esse componente
  em novos modais com input de texto)
- `components/task-item.tsx` — card de tarefa com subtarefas/checklist
  expansível
- `hooks/use-financeiro.ts` — toda a lógica e persistência do Financeiro
- `lib/financeiro-types.ts`, `lib/task-types.ts` — tipos compartilhados
- `lib/theme-provider.tsx` — tema claro/escuro

## Convenções de código

- Componentizar telas grandes em vez de deixar tudo em um arquivo só
  (o Financeiro já foi dividido assim; seguir o mesmo padrão)
- Confirmação (`Alert.alert`) antes de qualquer exclusão
- Toda tela/hook que carrega dados do AsyncStorage deve recarregar ao
  ganhar foco (`useFocusEffect`), não só no mount — evita dados
  desatualizados ao voltar de outra aba
- Rodar `npx tsc --noEmit` e `npx vitest run` depois de qualquer
  mudança antes de considerar a tarefa concluída
- **i18n**: textos da interface vêm de `lib/i18n/translations.ts`
  (chaves `t("secao.chave")`, dicionário `pt`/`en`) via `useSettings()`
  em `lib/settings-provider.tsx`. Não hardcodar texto em português nas
  telas — adicionar a chave nos dois idiomas em vez disso.
- **Moeda**: usar `formatCurrency()` de `useSettings()` para qualquer
  valor monetário exibido, nunca formatar na mão. Independe do idioma.
- Categorias do Financeiro (`Despesa.categoria`) guardam o **id**
  (ex.: `"alimentacao"`), não o label — o label é resolvido via `t()`
  no momento de exibir, para acompanhar o idioma atual.