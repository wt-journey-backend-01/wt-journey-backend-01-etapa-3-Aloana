exports.seed = async function(knex) {
  await knex('casos').del();
  await knex('casos').insert([
    {
      titulo: "homicidio",
      descricao: "Disparos foram reportados às 22:33 do dia 10/07/2007 na região do bairro União, resultando na morte da vítima, um homem de 45 anos.",
      status: "aberto",
      agente_id: 1
    },
    {
      titulo: "furto",
      descricao: "Relato de furto de veículo na região central, ocorrido na madrugada do dia 12/07/2007.",
      status: "solucionado",
      agente_id: 2
    },
    {
      titulo: "roubo",
      descricao: "Roubo a mão armada registrado no bairro Jardim, às 15:45 do dia 13/07/2007.",
      status: "aberto",
      agente_id: 3
    },
    {
      titulo: "sequestro",
      descricao: "Caso de sequestro relatado no bairro Primavera, com a vítima sendo resgatada às 10:00 do dia 14/07/2007.",
      status: "solucionado",
      agente_id: 4
    },
    {
      titulo: "vandalismo",
      descricao: "Ato de vandalismo em escola pública registrado no dia 15/07/2007, com danos significativos ao patrimônio.",
      status: "aberto",
      agente_id: 5
    },
    {
      titulo: "tráfico de drogas",
      descricao: "Operação policial contra tráfico de drogas realizada no dia 16/07/2007, resultando na apreensão de substâncias ilícitas.",
      status: "solucionado",
      agente_id: 6
    },
    {
      titulo: "assalto a banco",
      descricao: "Assalto a banco ocorrido no dia 17/07/2007, com reféns sendo mantidos por várias horas.",
      status: "solucionado",
      agente_id: 7
    },
    {
      titulo: "extorsão",
      descricao: "Caso de extorsão relatado no dia 18/07/2007, envolvendo ameaças a uma empresa local.",
      status: "aberto",
      agente_id: 8
    },
    {
      titulo: "homicídio culposo",
      descricao: "Acidente de trânsito resultando em morte, registrado no dia 19/07/2007.",
      status: "solucionado",
      agente_id: 9
    }
  ]);
};
