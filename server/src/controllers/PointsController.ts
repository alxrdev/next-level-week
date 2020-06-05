import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
  async index (req: Request, res: Response) {
    const { city, uf, items } = req.query

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()))
    
    const points = await knex('points')
      .select('points.*')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
    
    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://10.0.0.115:3333/uploads/${point.image}`
      }
    })

    return res.json(serializedPoints)
  }

  async show (req: Request, res: Response) {
    const { id } = req.params

    const point = await knex('points').where('id', id).first()

    if (!point) {
      return res.status(400).json({ message: 'Point not found.' })
    }

    const serializedPoint = {
      ...point,
      image_url: `http://10.0.0.115:3333/uploads/${point.image}`
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .select('items.title')
      .where('point_items.point_id', id)
    
    return res.json({ point: serializedPoint, items })
  }

  async create (req: Request, res: Response) {
    const { name, email, whatsapp, latitude, longitude, city, uf, items } = req.body
    const point = {
      image: req.file.filename, 
      name, email, whatsapp, latitude, longitude, city, uf }
    
    try {
      await knex.transaction(async trx => {        
        const insertedIds = await trx('points').insert(point)
          
        const pointItems = items
          .split(',')
          .map((item: string) => Number(item.trim()))
          .map((item_id: number) => {
            return { item_id, point_id: insertedIds[0] }
          })
  
        await trx('point_items').insert(pointItems)
  
        return res.json({
          id: insertedIds[0],
          ...point
        })
      })      
    } catch (err) {
      console.log(err)
    }
  }
}

export default PointsController
