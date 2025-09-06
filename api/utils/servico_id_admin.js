const db = require('../config/db');

async function getIdAdminByIdServico(req, res, next) {
    try {
        const adminId = req.adminId;
        console.log(adminId) // vem do token
        const id_servico = req.body.id;

        const query = `
      SELECT e.id_admin 
      FROM servicos s
      JOIN estabelecimento e ON s.id_estabelecimento = e.id
      WHERE s.id = $1
    `;
        const values = [id_servico];
        const { rows } = await db.query(query, values);
        console.log({rows});

        if (rows.length === 0) {
            console.log(`id_admin: ${adminId}`);
            return res.status(404).json({ error: "Serviço não encontrado" });
        }
        console.log('rows 0')
        console.log(rows[0].id_admin);
        if (adminId === rows[0].id_admin) {
            req.id = id_servico;
            return next();
        } else {
            return res.status(403).json({ error: "Acesso negado: admin inválido" });
        }
    } catch (err) {
        console.error("Erro no middleware getIdAdminByIdServico:", err);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
}

module.exports = getIdAdminByIdServico;