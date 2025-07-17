import express from 'express'
import { createPersonnel, deletePersonnel, getPersonnels, updatePersonnel } from '../controllers/product.controller.js'

const router = express.Router()

router.post('/', createPersonnel)
router.delete('/:id', deletePersonnel)
router.get('/', getPersonnels)
router.put('/:id', updatePersonnel)

export default router