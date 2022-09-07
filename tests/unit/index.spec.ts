import { expect } from "chai";
import { GetCloudSensorsResponse, GetSensorMetaDataResponse, MetaToCLoudMapping, readFile, ActiveCloudSensors } from "../../src";

describe('Compare Meta to Clould File', async function () {
    let cloudFile: GetCloudSensorsResponse;
    let metaFile: GetSensorMetaDataResponse;
    before(async function () {
        cloudFile = JSON.parse(await readFile('./All Cloud Sensors.json')) as GetCloudSensorsResponse;
        metaFile = JSON.parse(await readFile('./sensorMetadata.json')) as GetSensorMetaDataResponse;
    })

    describe('Sensor Meta Data', function() {
        it('should have all the entries on cloud file', function () {
            const missingSensors: string[] = []
            metaFile.sensors.forEach(sensor => {
                const cloudSensor = cloudFile.data.activeSensors.find(x => x[MetaToCLoudMapping.name as keyof ActiveCloudSensors] === sensor.name)
                if (cloudSensor === undefined) {
                    missingSensors.push(sensor.name);
                }
            });

            // Sensors found on meta file not on cloud file.
            // ['ENGINE1_AWL', 'ENGINE1_RSL', 'ENGINE1_MIL', 'ENGINE1_PRO', 'TRANS_OIL_DIFF_PRESS']
            expect(missingSensors).to.be.empty;
        })

        it('should name, sampleKey, displayName match', function () {
            const notMatchingName: string[] = metaFile.sensors.filter(x => x.name !== x.sampleKey || x.name !== x.displayName).map(x => x.name);
            expect(notMatchingName).to.be.empty;
        })

        //skips not found sensors
        it('should match unit of measurement from cloudfile', function () {
            const notMatchingUOM: string[] = metaFile.sensors.filter(x => cloudFile.data.activeSensors.find(c => c.alias === x.name) !== undefined 
                                                                    && x.unitOfMeasure !== cloudFile.data.activeSensors.find(c => c.alias === x.name)?.uom)
                                                                    .map(x => x.name);
            // Sensors with incorrect units of measurement
            // ['ENGINE1.HOURS.ETHO', 'DIRTY_POWER', 'POWERTRAIN1.PUMP_HHP']
            expect(notMatchingUOM).to.be.empty;
        })

        //skips not found sensors
        it('should have all the sensors as active', function () {
            const notActiveSensor: string[] = metaFile.sensors.filter(x => cloudFile.data.activeSensors.find(c => c.alias === x.name) !== undefined 
                                                                    && !cloudFile.data.activeSensors.find(c => c.alias === x.name)?.active)
                                                                    .map(x => x.name);
            expect(notActiveSensor).to.be.empty;
        })

        it('should not have duplicate sensors', function () {
            const set = new Set(metaFile.sensors.map(x => x.name));
            expect(metaFile.sensors.length).to.equal(set.size)
        })

        //skips not found sensors
        it('should not have duplicate sensors id from cloud file', function () {
            const sensorId: number[] = [];
            metaFile.sensors.forEach(sensor => {
                const cloudSensor = cloudFile.data.activeSensors.find(x => x[MetaToCLoudMapping.name as keyof ActiveCloudSensors] === sensor.name);
                if (cloudSensor) {
                    sensorId.push(cloudSensor.sensorId)
                }
            })
            const uniqueSensorId = new Set(sensorId);
            expect(uniqueSensorId.size).to.equal(sensorId.length);
        })

        it('shound have all the fields defined in meta file', function() {
            metaFile.sensors.forEach(sensor => {
                expect(sensor.name).not.to.be.empty;
                expect(sensor.displayName).not.to.be.empty;
                expect(sensor.sampleKey).not.to.be.empty;
                expect(sensor.unitOfMeasure).not.to.be.empty;
                if (sensor.constraints.length === 0) {
                    expect(sensor.constraints).to.be.empty;
                } else {
                    sensor.constraints.forEach(constraint => {
                        expect(constraint).not.to.be.empty;
                    })
                }
                if (sensor.ipcId !== undefined) {
                    expect(sensor.ipcId).not.to.be.empty;
                }
            })
        })

        it('shound have all the fields defined in cloud file', function() {
            cloudFile.data.activeSensors.forEach(sensor => {
                expect(sensor.alias).not.to.be.empty;
                expect(sensor.sensorId).to.be.greaterThan(0);
                expect(sensor.namespace).not.to.be.empty;
                expect(sensor.uom).not.to.be.empty;
                expect(typeof sensor.active).to.equal('boolean');
                if (sensor.grouping.length === 0) {
                    expect(sensor.grouping).to.be.empty;
                } else {
                    sensor.grouping.forEach(group => {
                        expect(group).not.to.be.empty;
                    })
                }
            })
        })
    })
})