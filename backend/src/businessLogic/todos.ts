import * as uuid from 'uuid';
import { createDynamoDBClient, getUserId } from '../lambda/utils';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb';

const docClient = createDynamoDBClient();
const TODOS_TABLE = process.env.TODOS_TABLE;
const TODOS_USER_ID_INDEX = process.env.TODO_USER_ID_INDEX;

export async function createTodo(newTodoRequest: CreateTodoRequest, event: APIGatewayProxyEvent) {

    const todoId = uuid.v4();
    const userId = getUserId(event);

    const item = {
        ...newTodoRequest,
        todoId,
        userId,
        createdAt: new Date().toISOString(),
        done: false
    }

    await docClient.put({
        TableName: TODOS_TABLE,
        Item: item
    }).promise();

    return item;
}

export async function deleteTodo(todoId: string) {
    await docClient.delete({
        TableName: TODOS_TABLE,
        Key: {
            'todoId': todoId
        },
        ConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
            ':todoId': todoId
        }
    }).promise();
}

export async function getTodos(event: APIGatewayProxyEvent) {
    const userId = getUserId(event);

    const result = await docClient.query({
        TableName: TODOS_TABLE,
        IndexName: TODOS_USER_ID_INDEX,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }).promise();

    return result.Items;
}

export async function updateTodo(todoId: string, updatedTodo: UpdateTodoRequest): Promise<UpdateItemOutput> {
    const updateParams = {
        TableName: TODOS_TABLE,
        Key: {
            'todoId': todoId
        },
        UpdateExpression: 'set done = :done, dueDate = :dueDate, #name = :name',
        ExpressionAttributeValues: {
            ":done": updatedTodo.done,
            ":dueDate": updatedTodo.dueDate,
            ":name": updatedTodo.name
        },
        ExpressionAttributeNames: {
            '#name': 'name'
        },
        ReturnValues: 'ALL_NEW'
    };

    return await docClient.update(updateParams).promise();
}