const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProjects = async (req, res) => {
  try {
    let where = {};
    if (req.userRole === 'Admin Direktorat') {
      where.direktoratId = req.userDirektoratId;
    } else if (req.userRole === 'Pegawai') {
      where.members = { some: { userId: req.userId } };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        direktorat: true,
        divisi: true,
        members: {
          include: { user: true }
        }
      }
    });
    res.status(200).send(projects);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, progress, direktoratId, divisiId, memberIds } = req.body;
    const project = await prisma.project.create({
      data: {
        name, description, status, progress: parseInt(progress),
        startDate: new Date(startDate), endDate: new Date(endDate),
        direktoratId: parseInt(direktoratId), divisiId: parseInt(divisiId),
        members: {
          create: (memberIds || []).map(id => ({ userId: parseInt(id) }))
        }
      }
    });
    res.status(201).send(project);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate, status, progress, memberIds } = req.body;
    
    // update project
    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        name, description, status, progress: parseInt(progress),
        startDate: new Date(startDate), endDate: new Date(endDate)
      }
    });

    if (memberIds) {
      await prisma.projectMember.deleteMany({ where: { projectId: parseInt(id) } });
      for (const mId of memberIds) {
        await prisma.projectMember.create({
          data: { projectId: parseInt(id), userId: parseInt(mId) }
        });
      }
    }

    res.status(200).send(project);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id: parseInt(id) } });
    res.status(200).send({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
