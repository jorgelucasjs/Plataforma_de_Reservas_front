# Guia de Desenvolvimento — LLM (Dao, Repository com zustand, Chakra UI v3, state pattern)

Objetivo
- Padronizar como a LLM deve gerar/alterar código no projeto: regras para DAOs, repositories que usam zustand, uso de Chakra UI v3 e padrão de hooks de UI state (ex.: `const { checkout, setCheckout } = useCheckoutUiState()`).

1) Convenções gerais
- Linguagem: TypeScript.
- Tipos explícitos para todos os DTOs/entidades expostas publicamente.
- Funções assíncronas retornam Promise<T> e documentam erros esperados.
- Nomeclatura: verbs para métodos (load*, create*, update*, delete*), nouns para stores/hooks (checkoutStore, useCheckoutUiState).

2) Estrutura de pastas (sugerida)
- src/
  - dao/           -> acessos a dados (fetch, api client)
  - repositories/  -> regra de negócio, transforma DTOs e atualiza stores
  - stores/        -> zustand stores / hooks UI state
  - ui/            -> componentes React com Chakra UI
  - types/         -> tipos/DTOs compartilhados
  - services/      -> integrações cross-cutting (auth, logger, cache)

3) DAO (Data Access Object)
- Responsabilidade: apenas chamada ao backend / storage e mapeamento mínimo de dados.
- Assinatura: export async function getCheckout(id: string): Promise<CheckoutDto>
- Tratamento de erros: lançar erro com mensagem padronizada ou retornar um Result<T, Error> (consistência no projeto).
- Não deve tocar no estado da aplicação (não chamar zustand, nem setState).
- Exemplos de boas práticas:
  - Usar fetch/axios centralizado (reutilizável).
  - Mapear respostas (p.ex. parse/validate via zod) e devolver tipos claros.

4) Repository (com zustand)
- Responsabilidade: orquestrar chamadas aos DAOs, transformar dados para a UI e atualizar stores.
- Deve usar os hooks/stores do zustand (p.ex. useCheckoutUiState) para atualizar estado.
- Padrão de métodos:
  - Nome: loadCheckout, addItemToCheckout, removeItemFromCheckout, confirmCheckout.
  - Cada método: chamar DAO, transformar, atualizar store via setters (ex.: setCheckout).
- Erros: tratar localmente quando necessário (p.ex. mapeamento), ou re-lançar para a camada superior exibir mensagens.
- Exemplo mínimo:
  - const { setCheckout, checkout } = useCheckoutUiState();
  - async function loadCheckout(id: string) {
      const dto = await dao.getCheckout(id);
      setCheckout(dto); // aceitar objeto completo ou partial via implementação do hook
    }

5) Stores / Hooks (zustand)
- Cada domínio tem um hook com assinatura consistente: useXxxUiState.
- Padrão de uso: const { checkout, setCheckout } = useCheckoutUiState()
- Regras para setters:
  - Nome: set<NomeState> (ex.: setCheckout).
  - Aceitar valor direto ou função atualizadora: setCheckout(newVal) ou setCheckout(prev => ({ ...prev, foo: 'bar' }))
  - Preferir updates funcionais quando a alteração depende do estado atual.
- Exemplo de shape (conceitual):
  - checkout: Checkout | null
  - setCheckout: (c: Checkout | ((prev: Checkout | null) => Checkout | null)) => void
  - loadStatus, error, helpers (ex.: isLoadingCheckout)

6) Chakra UI v3 — diretrizes
- Usar componentes do Chakra e tokens do theme.
- Preferir props de estilo do Chakra (p.ex. p, m, bg) em vez de CSS inline.
- Acessibilidade: sempre preencher aria-labels quando aplicável.
- Componentes devem ser controlados via props e/ou usar os hooks de store (não manipular global state diretamente).
- Evitar dependência direta do store dentro de componentes presentacionais; favor passar dados via props para facilitar testes.

7) Fluxo recomendado ao implementar uma feature nova
1. Criar/atualizar tipos em src/types.
2. Implementar/ajustar DAO em src/dao (apenas IO).
3. Implementar método no repository (src/repositories) que usa DAO e atualiza store.
4. Atualizar/consumir useXxxUiState em src/stores.
5. Implementar UI em src/ui usando Chakra, recebendo dados via props ou consumindo hook se componente for container.
6. Testes e documentação mínima no PR.

8) Tratamento de erros e UX
- Repositories só fazem tratamento de transformação; apresentação de erro fica com camada UI.
- Sempre propagar erros com contexto (mensagens legíveis).
- Store pode manter flags de status (isLoading, errorMessage) para a UI consumir.

9) Testes
- DAO: testes unitários com msw ou mock de fetch.
- Repository: mock de DAO e asserts sobre chamadas ao store.
- Stores: testar reducers/setters diretamente.
- UI: testes de render com providers (ChakraProvider + store).

10) Exemplos rápidos

- Exemplo: uso do hook de estado
```ts
// conceptual example (não inserir no código sem adaptação)
const { checkout, setCheckout } = useCheckoutUiState();
setCheckout(prev => ({ ...prev, items: [...prev?.items ?? [], newItem] }));
```

- Exemplo: repository action
```ts
async function loadCheckout(repoDeps, id: string) {
  const dto = await dao.getCheckout(id);
  // transformar se necessário
  const uiModel = transformDtoToUi(dto);
  const { setCheckout } = useCheckoutUiState();
  setCheckout(uiModel);
}
```

11) Convenções de PR / commits
- Commit messages imperativos e curtos: "feat(checkout): add repository loadCheckout"
- PRs com descrição clara, passos para testar e exemplos de payloads.

12) Checklist para a LLM antes de gerar código
- Use types explícitos.
- DAO não altera estado.
- Repositório atualiza store via useXxxUiState e trata transformações.
- Chakra v3: usar tokens e props de estilo.
- Fornecer testes ou instruções de testes.
- Respeitar nomes e padrão setXxx.

Fim.

