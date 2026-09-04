# Registro de Cuidados Sunshine / Sunshine Care Log

> Uma ferramenta gratuita de código aberto para rastrear cuidados diários de pacientes idosos — projetada para cuidadores familiares.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-rose)](https://anwer3712.github.io/diet-log/)

---

## O que é isso?

Um aplicativo web bilíngue (Chinês Tradicional 🇹🇼 / Indonésio 🇮🇩) projetado para ajudar **cuidadores familiares** a rastrear dados de saúde diários de pacientes idosos em casa — especialmente aqueles com condições crônicas que requerem gerenciamento rigoroso de líquidos (insuficiência cardíaca, diálise, recuperação pós-cirúrgica).

Sem necessidade de instalação. Funciona em qualquer navegador de smartphone. Os dados são sincronizados com Google Sheets via Google Apps Script.

---

## Recursos

- **Rastreamento de ingestão de fluidos** — água, bebidas medicadas, suplementos nutricionais, refeições (com meta diária e barra de progresso)
- **Rastreamento de produção de fluidos** — volume de urina + cor, movimentos intestinais com status
- **Algoritmo inteligente de meta de urina** — calcula automaticamente a produção de urina esperada com base na meta de ingestão de água, ajustada para medicamentos diuréticos (faixa ×1,1–1,5) vs. sem medicamento (faixa ×0,4–0,6)
- **Aviso de sobrecarga de fluidos** — alerta vermelho quando a ingestão total ultrapassa 1.200 c.c.
- **Registro de exercícios** — levantamento de garrafas, pressão de pés, flexão de joelhos, assistência ao levantar (com lista de verificação do protocolo de segurança)
- **Pressão arterial e frequência cardíaca** — medições matinais e noturnas com diretrizes de medição
- **Sistema de alerta de constipação** — acionado automaticamente a cada 2 horas entre 60–72 horas após o último movimento intestinal, com instruções de segurança bilíngues proibindo o uso de enema sem supervisão
- **Rastreamento de estado de medicamentos** — diuréticos e laxantes, persistidos na nuvem
- **Sistema de lembrete baseado em tempo** — lembretes inteligentes para medição de PA, slots de exercícios e verificação de urina antes de dormir
- **Sincronização em nuvem** — todos os dados salvos no Google Sheets via Google Apps Script; suporta casas com múltiplos cuidadores
- **Interface otimista** — os registros aparecem instantaneamente sem esperar pela resposta do servidor
- **Lembretes de limpeza semanal** — cronograma integrado para tarefas de higiene doméstica

---

## Para quem é isso?

- Membros da família cuidando de pais ou avós idosos em casa
- Casas com múltiplos cuidadores rotativos (especialmente através de barreiras linguísticas)
- Pacientes com condições que requerem monitoramento rigoroso de fluidos (insuficiência cardíaca, diálise, recuperação pós-cirúrgica)

---

## Pilha Tecnológica

| Camada | Tecnologia |
|-------|-----------|
| Frontend | HTML + JavaScript + Tailwind CSS vanilla |
| Backend | Google Apps Script (sem servidor) |
| Banco de dados | Google Sheets |
| Hospedagem | GitHub Pages (gratuito) |

Sem frameworks. Sem ferramentas de construção. Sem dependências para instalar. Abre diretamente em qualquer navegador.

---

## Configuração / Auto-hospedagem

1. Fork este repositório
2. Implante seu próprio backend do Google Apps Script (veja `GAS_URL` em `index.html`)
3. Crie uma Google Sheet para armazenamento de dados
4. Atualize as constantes `GAS_URL` e `SPREADSHEET_URL` em `index.html`
5. Ative GitHub Pages no seu fork → pronto

---

## Capturas de tela

| Rastreamento diário | Entrada guiada bilíngue | Análise de tendências |
|---|---|---|
| Log de cuidados diários: faixa de progresso, meta de ingestão de fluidos com barra de progresso, seleção de categorias água/medicamentos/nutrição/refeições | Tela de entrada guiada mostrando instruções em chinês tradicional e indonésio lado a lado, com etapas numeradas | Página de análise de tendências de saúde com seletor de intervalo de 7/14/30 dias e quinze gráficos de variáveis cruzadas selecionáveis |
| Faixa de progresso, meta de fluidos e registro de categorias | Cada string em chinês tradicional e indonésio, passo a passo | 15 gráficos de variáveis cruzadas (7/14/30 dias) |

*（Demo ao vivo: https://anwer3712.github.io/diet-log/ — capturas de tela tiradas em viewport de 414×896 pixels）*

---

## Motivação

Construído por necessidade. Quando um membro da família precisava de cuidados domiciliares 24/7 com gerenciamento rigoroso de fluidos, os aplicativos existentes eram muito complexos, apenas em inglês ou exigiam assinaturas mensais. Esta ferramenta tem como objetivo fornecer uma solução simples, gratuita e multilíngue para que os cuidadores possam se concentrar no paciente, não no aplicativo.

---

## Roadmap

Melhorias planejadas — cada uma é um problema em aberto, comentários da comunidade bem-vindos:

- [ ] [#15](https://github.com/anwer3712/diet-log/issues/15) **Análise de saúde assistida por IA** — integre Claude para detectar tendências anormais em dados de ingestão de fluidos, produção de urina e pressão arterial, e traduzir números brutos em orientações de cuidados em linguagem simples
- [ ] [#16](https://github.com/anwer3712/diet-log/issues/16) **P&R do cuidador com IA** — permita que os cuidadores façam perguntas em seu próprio idioma ("sua urina estava escura hoje, devo me preocupar?") com base nos dados realmente registrados do paciente
- [ ] [#17](https://github.com/anwer3712/diet-log/issues/17) **Pares de idiomas adicionais** — inglês, vietnamita, tagalo, tailandês para casas de cuidados multiculturais
- [ ] [#18](https://github.com/anwer3712/diet-log/issues/18) **Modo offline** — cache de trabalho de serviço para conexões instáveis
- [ ] [#19](https://github.com/anwer3712/diet-log/issues/19) **Relatórios semanais imprimíveis** — resumos de uma página para consultas médicas
- [ ] [#20](https://github.com/anwer3712/diet-log/issues/20) **Suporte a múltiplos pacientes** — para casas ou pequenas instalações de cuidados rastreando mais de uma pessoa

---

## Contribuindo

Pull requests bem-vindos — veja [CONTRIBUTING.md](CONTRIBUTING.md) para saber como ajudar (contribuições de tradução são especialmente apreciadas). Este projeto segue um [Código de Conduta](CODE_OF_CONDUCT.md).

Se você cuida de um membro da família idosa e precisa de um recurso — [abra um problema](https://github.com/anwer3712/diet-log/issues).

---

## Segurança

Encontrou uma vulnerabilidade? Informe-a em particular — veja [SECURITY.md](SECURITY.md).
Não abra um problema público e nunca inclua dados de pacientes reais em um relatório.

---

## Licença

MIT © 2026 anwer3712
