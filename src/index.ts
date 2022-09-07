import fs from 'fs';

export function readFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (error: NodeJS.ErrnoException | null, data: Buffer) => {
            if (error) {
                reject(error);
            } else {
                resolve(data.toString());
            }
        });
    });
}

export interface GetCloudSensorsResponse {
    data: CloudSensorsData
}

export interface CloudSensorsData {
    activeSensors: ActiveCloudSensors[]
}

export interface ActiveCloudSensors {
    sensorId: number;
    namespace: string;
    alias: string;
    uom: string;
    grouping: string[]
    active: boolean
}

export interface GetSensorMetaDataResponse {
    sensors:SensorMetaData[]
} 

export interface SensorMetaData {
    name: string;
    unitOfMeasure: string;
    sampleKey: string;
    displayName: string;
    constraints: string[];
    ipcId: string | undefined;
}


export const MetaToCLoudMapping =  {
    name: 'alias',
    unitOfMeasure: 'uom'
}