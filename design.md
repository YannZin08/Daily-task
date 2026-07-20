# Design do Aplicativo - Task Daily

## Visão Geral
Um aplicativo mobile simples e intuitivo para gerenciar tarefas diárias. O usuário pode adicionar tarefas (como academia, cursos, etc.), marcá-las como concluídas com um check e removê-las quando necessário.

## Screens

### 1. Home Screen (Lista de Tarefas)
- **Conteúdo Principal**: Lista de tarefas do dia
- **Componentes**:
  - Header com título "Tarefas do Dia" e contador de tarefas concluídas
  - Lista de tarefas em cards individuais
  - Cada card exibe:
    - Checkbox (para marcar como concluído)
    - Nome da tarefa
    - Botão de deletar (ícone de lixeira)
  - Botão flutuante (FAB) no canto inferior direito para adicionar nova tarefa
  - Mensagem vazia quando não há tarefas

### 2. Add Task Sheet (Modal de Adição)
- **Conteúdo Principal**: Formulário para adicionar nova tarefa
- **Componentes**:
  - Campo de texto para nome da tarefa (placeholder: "Digite a tarefa...")
  - Botão "Adicionar" para confirmar
  - Botão "Cancelar" para fechar o modal
  - Validação: não permitir tarefas vazias

## Fluxos de Usuário

### Fluxo 1: Adicionar Tarefa
1. Usuário toca no botão FAB (+)
2. Modal abre com campo de entrada
3. Usuário digita o nome da tarefa (ex: "Academia", "Tarefa de Curso")
4. Usuário toca "Adicionar"
5. Modal fecha e tarefa aparece na lista

### Fluxo 2: Marcar Tarefa como Concluída
1. Usuário vê a tarefa na lista
2. Usuário toca no checkbox
3. Tarefa é marcada como concluída (visual: strikethrough, opacidade reduzida)
4. Contador de tarefas concluídas é atualizado

### Fluxo 3: Desmarcar Tarefa
1. Usuário toca novamente no checkbox de uma tarefa concluída
2. Tarefa volta ao estado não concluído

### Fluxo 4: Deletar Tarefa
1. Usuário toca no ícone de lixeira
2. Tarefa é removida da lista

## Cores e Estilo

### Paleta de Cores
- **Primary**: #0a7ea4 (azul)
- **Background**: #ffffff (light) / #151718 (dark)
- **Surface**: #f5f5f5 (light) / #1e2022 (dark)
- **Foreground**: #11181C (light) / #ECEDEE (dark)
- **Muted**: #687076 (light) / #9BA1A6 (dark)
- **Success**: #22C55E (verde)
- **Error**: #EF4444 (vermelho)

### Tipografia
- Título: 24px, bold
- Subtítulo/Card: 16px, regular
- Labels: 14px, regular

## Interações
- **Tap Feedback**: Botões e cards com feedback visual (opacidade 0.7-0.8)
- **Haptics**: Feedback tátil ao adicionar/deletar tarefas (leve)
- **Animações**: Transições suaves ao abrir/fechar modal

## Armazenamento
- Dados persistidos localmente usando AsyncStorage
- Tarefas salvas automaticamente após cada ação
