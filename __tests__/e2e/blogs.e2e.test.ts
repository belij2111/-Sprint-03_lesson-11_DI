import {blogCollection, connectToDb} from "../../src/db/mongo-db";
import {SETTINGS} from "../../src/settings";
import {blogDto} from "../tests-dtos/blog-dto";
import {blogsTestManager} from "./tests-managers/blogs-test-Manager";
import {startMongoServer, stopMongoServer} from "../mongo-memory-setup";
import {req} from "../test-helpers";
import {Response} from "supertest";
import {sortParamsDto} from "../tests-dtos/sort-params-dto";

describe('Blogs Components', () => {
    beforeAll(async () => {
        await connectToDb(await startMongoServer())
        // await connectToDb(SETTINGS.MONGO_URL)
    })
    beforeEach(async () => {
        await blogCollection.deleteMany()
    })
    afterAll(async () => {
        await blogCollection.deleteMany()
        await stopMongoServer()
    })
    it('should return version number', async () => {
        await req
            .get('/')
            .expect({version: '1.0'})
    })

    describe('GET/blogs', () => {
        it(`should return blogs empty array : STATUS 200`, async () => {
            const result: Response = await req
                .get(SETTINGS.PATH.BLOGS)
                .expect(200)
            expect(result.body.items.length).toBe(0)
            // console.log(result.body)
        })
        it(`should return blogs with paging : STATUS 200`, async () => {
            const authorizationHeader = await blogsTestManager.createAuthorizationHeader('Basic', SETTINGS.ADMIN_AUTH)
            const createBlogs = await blogsTestManager.createBlogs(authorizationHeader, 4)
            const {pageNumber, pageSize, sortBy, sortDirection} = sortParamsDto
            const searchNameTerm = "Blog"
            const result: Response = await req
                .get(SETTINGS.PATH.BLOGS)
                .query({
                    searchNameTerm,
                    pageNumber,
                    pageSize,
                    sortBy,
                    sortDirection
                })
                .expect(200)
            expect(result.body.items.length).toBe(createBlogs.length)
            expect(result.body.totalCount).toBe(createBlogs.length)
            expect(result.body.items).toEqual(createBlogs)
            expect(result.body.pagesCount).toBe(1)
            expect(result.body.page).toBe(1)
            expect(result.body.pageSize).toBe(10)
            // console.log(result.body.items)
        })
    })

    describe('POST/blogs', () => {
        it(`should create new blog : STATUS 201`, async () => {
            const validBlog = blogDto.validBlogsDto(1)
            const authorizationHeader = await blogsTestManager.createAuthorizationHeader('Basic', SETTINGS.ADMIN_AUTH)
            const result: Response = await req
                .post(SETTINGS.PATH.BLOGS)
                .set(authorizationHeader)
                .send(validBlog)
                .expect(201)
            expect(result.body).toEqual({
                id: expect.any(String),
                name: validBlog.name,
                description: validBlog.description,
                websiteUrl: validBlog.websiteUrl,
                createdAt: expect.any(String),
                isMembership: expect.any(Boolean)
            })
            // console.log(result.body)
        })
        it(`shouldn't create new blog with incorrect input data : STATUS 400`, async () => {
            const invalidBlog = blogDto.invalidBlogsDto(777)
            const authorizationHeader = await blogsTestManager.createAuthorizationHeader('Basic', SETTINGS.ADMIN_AUTH)
            const result: Response = await req
                .post(SETTINGS.PATH.BLOGS)
                .set(authorizationHeader)
                .send(invalidBlog)
                .expect(400)
            // console.log(result.body)
        })
        it(`shouldn't create new blog if the request is unauthorized : STATUS 401`, async () => {
            const validBlog = blogDto.validBlogsDto(1)
            const invalidAuthorizationHeader = await blogsTestManager.createAuthorizationHeader('Basic', 'invalid')
            const result: Response = await req
                .post(SETTINGS.PATH.BLOGS)
                .set(invalidAuthorizationHeader)
                .send(validBlog)
                .expect(401)
            // console.log(result.status)
        })
    })

})