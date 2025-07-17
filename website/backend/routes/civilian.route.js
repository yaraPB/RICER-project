import express from 'express'
import { createCivilian, deleteCivilian, getCivilians, updateCivilian } from '../controllers/product.controller.js'

const router = express.Router()

router.post('/', createCivilian)
router.delete('/:id', deleteCivilian)
router.get('/', getCivilians)
router.put('/:id', updateCivilian)

export default router