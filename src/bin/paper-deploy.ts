import * as pages from 'gh-pages'
import * as commander from 'commander'
import File from '../utils/file'
import Log from '../utils/log'
import { findSource, assignConfig } from '../utils/check'
import chalk from 'chalk'

commander
  .option('-m, --message', 'server port')
  .parse(process.argv)

const message = commander.args[0] || 'paper update'
;(async() => {
  const pagesDir = `${__dirname}/../../node_modules/gh-pages/`
  const cachePath = `${process.cwd()}/.paper.deploy.cache`
  const __user = process.cwd()
  const resetDir = async(path: string) => {
    await File.exists(path) && await File.exec(`rm -rf ${path}`)
  }
  
  console.log(`deploy message: ${chalk.green(`${message}`)}`)
  if (!commander.args[0]) {
    console.log(`you can use ${chalk.green('[-m]')} to add information.\n`)
  }
  
  Log.time.start('check config')
  const source: string = await findSource(__user)
  const config: Config = await assignConfig(source)
  const distPath: string = `${__user}/${config.output}`

  if (!await File.exists(distPath) || !await File.exists(`${distPath}/index.html`)) {
    console.log(chalk.red('\nError: not found document.'))
    console.log(chalk.green('you need to run the [paper build] first.'))
    return Log.time.over(false)
  }
  pages.clean()
  Log.time.over()
  
  Log.time.start('deploy to github')
  try {
    await resetDir(cachePath)
    await File.exec(`mkdir ${cachePath}`)
    await File.exec(`cp -R ${pagesDir} ${cachePath}/`)
    await File.exec(`cd ${process.cwd()} && ${cachePath}/bin/gh-pages -d ${config.output} -m ${message}`)
    await resetDir(cachePath)
  } catch (e) {
    await resetDir(cachePath)
    console.log(`${String(e)}\n`)
    Log.time.over(false)
  }
  Log.time.over()
  // pages.publish(distPath, {
  //   message,
  //   branch: 'gh-pages',
  // }, err => {
  //   if (err) {
  //     console.log(chalk.red(`Error: ${err}`))
  //     return Log.time.over(false)
  //   }
  //   Log.time.over()
  // })
})()
