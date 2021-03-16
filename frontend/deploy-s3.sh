#!/bin/sh

aws s3 rm s3://portfolio-frontend-ameba/ --recursive
aws s3 cp build s3://portfolio-frontend-ameba/ --recursive