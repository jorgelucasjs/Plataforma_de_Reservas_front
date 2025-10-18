
Objetivo:
Desenvolver uma aplicação web consumindo a API que você criou anteriormente
(seu teste passado) para a plataforma de contratação de prestadores de serviços.


Requisitos:

Autenticação e Autorização:
• Implemente uma tela de login onde os utilizadores possam se autenticar
utilizando e-mail e senha, ou NIF e senha (também são únicos).
• Após a autenticação, guarde o token JWT no estado global (se preferir) ou no
local storage.
Gerenciamento de Serviços:
1. Implemente uma tela onde prestadores de serviços possam criar novos
serviços.2 - 3
2. Campos necessários: Título (nome), Descrição, Preço
3. Implemente uma lista de serviços criados pelo prestador autenticado.
4. Adicione funcionalidades para editar e excluir serviços.
Contratação de Serviços:
1. Implemente uma tela onde apenas clientes possam visualizar todos os
serviços disponíveis.
2. Adicione a funcionalidade para que clientes possam contratar serviços.
3. Antes de permitir a contratação, verifique se o cliente tem saldo suficiente.
4. Atualize o saldo do cliente e do prestador após a contratação.
Histórico de Transações:
1. Implemente uma tela onde os usuários possam visualizar o histórico de todas
as transações realizadas na plataforma.
2. O histórico deve mostrar informações como o serviço contratado, o prestador,
o cliente e o valor da transação.
Validações:
1. Garanta que apenas prestadores possam criar, editar e excluir serviços.
2. Adicione validações nos seus formulários ou campos de entrada
3. Garanta que clientes só possam contratar serviços se tiverem saldo
suficiente.
4. Certifique-se de que todas as operações de saldo sejam atômicas para
evitar inconsistências.3 - 3


Critérios de Avaliação:
• Funcionalidade: A aplicação atende a todos os requisitos?
• Código: O código é limpo, bem organizado e segue boas práticas?
• Interface: A interface é intuitiva e responsiva?
• Ecossistema: Preferencialmente, utilize ao máximo o ecossistema React para
estilos, gerenciamento de estado global, consumo de API, formulários, ou
outras necessidades.
• Componentização: A Aplicação está dividida em componentes reutilizáveis?
• Gerenciamento de Estado: O gerenciamento de estado é eficaz e bem
implementado?


• Validações: As validações e verificações de permissões estão corretas?


ATT: Usa toda sua Criatividade e estás livre de adicionar funcionalidades, ou
semelhantes para melhorar o projeto.
Boa Sorte!!!