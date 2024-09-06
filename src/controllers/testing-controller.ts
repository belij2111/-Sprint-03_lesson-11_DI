import {TestingMongoRepository} from "../repositories/testing-mongo-repozitory";
import {Request, Response} from "express";

class TestingController {
    constructor(private testingMongoRepository: TestingMongoRepository) {
    }

    async deleteAll(req: Request, res: Response) {
        try {
            await this.testingMongoRepository.deleteAllData()
            res
                .status(204)
                .json({message: 'Attention the database has been cleared'})
        } catch (error) {
            res
                .status(500)
                .json({message: 'testingController.deleteAll'})
        }
    }
}

const testingMongoRepository = new TestingMongoRepository()
export const testingController = new TestingController(testingMongoRepository)