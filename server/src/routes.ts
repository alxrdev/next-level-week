import express from 'express'
import multer from 'multer'
import multerConfig from './config/multer'
import { celebrate, Joi, Segments } from 'celebrate'

import ItemsController from './controllers/ItemsController'
import PointsController from './controllers/PointsController'

const routes = express.Router()
const upload = multer(multerConfig)

const itemsController = new ItemsController()
const pointsController = new PointsController()

routes.get('/items', itemsController.index)

routes.get('/points', pointsController.index)
routes.post(
  '/points',
  upload.single('image'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required()
    })
  }, {
    abortEarly: false
  }),
  pointsController.create
)
routes.get('/points/:id', pointsController.show)

export default routes
