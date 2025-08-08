exports.seed = async function(knex) {
  // Primeiro, apague os dados existentes (ordem importa pelo FK!)
  await knex('casos').del();
  await knex('agentes').del();

  // Agentes (sem campo id)
  const agentesData = [
    { nome: "Rommel Carneiro",    dataDeIncorporacao: "1992-10-04", cargo: "delegado" },
    { nome: "Aloana Silva",       dataDeIncorporacao: "2024-05-15", cargo: "investigadora" },
    { nome: "Carlos Souza",       dataDeIncorporacao: "2010-03-20", cargo: "agente" },
    { nome: "Fernanda Lima",      dataDeIncorporacao: "2012-07-30", cargo: "perita" },
    { nome: "João Pereira",       dataDeIncorporacao: "2018-11-10", cargo: "escrivão" },
    { nome: "Mariana Costa",      dataDeIncorporacao: "2020-01-05", cargo: "agente" },
    { nome: "Roberto Alves",      dataDeIncorporacao: "2021-06-15", cargo: "investigador" },
    { nome: "Patrícia Rocha",     dataDeIncorporacao: "2019-09-25", cargo: "agente" },
    { nome: "Lucas Martins",      dataDeIncorporacao: "2022-02-18", cargo: "delegado" }
  ];

  // Insere e captura os ids
  const agentesIds = await knex('agentes')
    .insert(agentesData)
    .returning('id'); // array, ordem igual ao array de agentes

  // Casos
  const casosData = [
    {
      titulo: "homicidio",
      descricao: "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
      status: "aberto",
      agente_id: agentesIds[0].id
    },
    {
      titulo: "furto",
      descricao: "Relato de furto de veículo na região central, ocorrido na madrugada do dia 12/07/2007.",
      status: "solucionado",
      agente_id: agentesIds[1].id
    },
    {
      titulo: "roubo",
      descricao: "Roubo a mão armada registrado no bairro Jardim, às 15:45 do dia 13/07/2007.",
      status: "aberto",
      agente_id: agentesIds[2].id
    },
    {
      titulo: "sequestro",
      descricao: "Caso de sequestro relatado no bairro Primavera, com a vítima sendo resgatada às 10:00 do dia 14/07/2007.",
      status: "solucionado",
      agente_id: agentesIds[3].id
    },
    {
      titulo: "vandalismo",
      descricao: "Ato de vandalismo em escola pública registrado no dia 15/07/2007, com danos significativos ao patrimônio.",
      status: "aberto",
      agente_id: agentesIds[4].id
    },
    {
      titulo: "tráfico de drogas",
      descricao: "Operação policial contra tráfico de drogas realizada no dia 16/07/2007, resultando na apreensão de substâncias ilícitas.",
      status: "solucionado",
      agente_id: agentesIds[5].id
    },
    {
      titulo: "assalto a banco",
      descricao: "Assalto a banco ocorrido no dia 17/07/2007, com reféns sendo mantidos por várias horas.",
      status: "solucionado",
      agente_id: agentesIds[6].id
    },
    {
      titulo: "extorsão",
      descricao: "Caso de extorsão relatado no dia 18/07/2007, envolvendo ameaças a uma empresa local.",
      status: "aberto",
      agente_id: agentesIds[7].id
    },
    {
      titulo: "homicídio culposo",
      descricao: "Acidente de trânsito resultando em morte, registrado no dia 19/07/2007.",
      status: "solucionado",
      agente_id: agentesIds[8].id
    }
  ];

  await knex('casos').insert(casosData);
};
